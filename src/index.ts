import { Factory as WalletFactory } from "@swtc/wallet";
import { Factory as SerializerFactory } from "@swtc/serializer";
import { HASHPREFIX, SM3, convertStringToHex } from "@swtc/common";
import BigNumber from "bignumber.js";
import {
  fetchSequence,
  fetchTransaction,
  requestAccountToken,
  requestAccountTx,
  requestTokenInfo,
  submitTransaction
} from "./rpc";
import { ExchangeType, IMemo, ISignerEntry, IToken, TokenFlag, TokenInfo } from "./type";
import {
  serialize721Delete,
  serialize721Payment,
  serialize721Publish,
  serializeBrokerage,
  serializeCancelOrder,
  serializeCreateOrder,
  serializeIssueSet,
  serializeManageIssuer,
  serializePayment,
  serializeRemoveBlackList,
  serializeSetAccount,
  serializeSetBlackList,
  serializeSignerList,
  serializeTokenIssue
} from "./tx";
import { swtcSequence } from "./sequence";
const createHash = require("create-hash");
const cloneDeep = require("lodash.clonedeep");

export type ISupportChain = "jingtum" | "bizain" | "seaaps";

export * from "./tx";

export interface ChainOption {
  guomi: boolean;
  ACCOUNT_ALPHABET?: string;
  currency?: string;
  fee?: number;
}

export interface SignResult {
  hash: string;
  blob: string;
}

const normalizeMemos = (memos) => {
  return memos.map((memo) => {
    const { MemoData, MemoType } = memo.Memo;
    if (MemoType === "string") {
      return {
        Memo: {
          MemoData: convertStringToHex(MemoData),
          MemoType: convertStringToHex(MemoType)
        }
      };
    }
    if (MemoType === "hex") {
      return {
        Memo: {
          MemoData: MemoData.length % 2 > 0 ? `${MemoData}0` : MemoData,
          MemoType: convertStringToHex(MemoType)
        }
      };
    }
  });
};

export class Wallet {
  public readonly wallet;
  protected readonly serializer;
  protected readonly sha256: (bytes: string | Uint8Array) => string;

  constructor(chain: ISupportChain | ChainOption) {
    this.wallet = WalletFactory(chain);
    this.serializer = SerializerFactory(this.wallet);
    const opts = chain as ChainOption;
    this.sha256 = opts?.guomi
      ? (message) => new SM3().update(message).digest("hex")
      : (message) => createHash("sha256").update(message).digest("hex");
  }

  public getAddress(secret: string): string {
    const wallet = this.wallet.fromSecret(secret);
    return wallet.address;
  }

  public generateHash256(msg: string | Uint8Array): string {
    return this.sha256(msg);
  }

  public isValidAddress(address: string): boolean {
    return this.wallet.isValidAddress(address);
  }

  public isValidSecret(secret: string): boolean {
    return this.wallet.isValidSecret(secret);
  }

  public createWallet() {
    return this.wallet.generate();
  }

  public getFee(): number {
    return this.wallet.getFee();
  }

  public getCurrency(): string {
    return this.wallet.getCurrency();
  }

  public getIssuer(): string {
    return this.wallet.getIssuer();
  }

  public sign(tx: any, secret: string): SignResult {
    const wallet = new this.wallet(secret);
    const copyTx = Object.assign({}, tx);
    copyTx.SigningPubKey = wallet.getPublicKey();
    const prefix = HASHPREFIX.transactionSig;
    const blob = this.serializer.from_json(copyTx);
    let hash: string;
    if (wallet.isEd25519()) {
      hash = `${prefix.toString(16).toUpperCase()}${blob.to_hex()}`;
    } else {
      hash = blob.hash(prefix);
    }
    copyTx.TxnSignature = wallet.signTx(hash);
    const sendBlob = this.serializer.from_json(copyTx);
    return {
      hash: sendBlob.hash(HASHPREFIX.transactionID),
      blob: sendBlob.to_hex()
    };
  }

  public multiSign(tx: any, secret: string): any {
    const wallet = new this.wallet(secret);
    const copyTx = cloneDeep(tx);
    // 多签的时候SigningPubKey必须有但是保持为空
    copyTx.SigningPubKey = "";
    // Fee按照笔数计算，考虑最大8笔，最高是0.01
    copyTx.Fee = 0.08;

    let blob = this.serializer.from_json(copyTx);
    blob = this.serializer.adr_json(blob, wallet.address());

    const prefix = HASHPREFIX.transactionMultiSig;
    let hash: string;
    if (wallet.isEd25519()) {
      hash = `${prefix.toString(16).toUpperCase()}${blob.to_hex()}`;
    } else {
      hash = blob.hash(prefix);
    }

    if (Array.isArray(tx.Memos)) {
      copyTx.Memos = normalizeMemos(tx.Memos);
    }

    const keys = ["Amount", "Fee", "LimitAmount", "TakerGets", "TakerPays"];

    for (const key of keys) {
      const value = new BigNumber(copyTx[key]);
      // if the value is native, need revert value
      // it's shit.
      if (!value.isNaN()) {
        copyTx[key] = value.multipliedBy(1e6).toString();
      }
    }

    return Object.assign({}, copyTx, {
      Signers: [
        {
          Signer: {
            Account: wallet.address(),
            SigningPubKey: wallet.getPublicKey(),
            TxnSignature: wallet.signTx(hash)
          }
        }
      ]
    });
  }
}

export class Transaction {
  private nodes: string[];
  public readonly wallet: Wallet;
  private retry: number;

  constructor(chain: ISupportChain | ChainOption, nodes: string[], retry = 0) {
    this.wallet = new Wallet(chain);
    this.nodes = nodes;
    this.retry = retry;
  }

  static async fetchSequence(node: string, address: string): Promise<number> {
    return await fetchSequence(node, address);
  }

  static async fetchTransaction(node: string, hash: string): Promise<any> {
    return await fetchTransaction(node, hash);
  }

  /**
   * 查看账户历史交易
   *
   * @static
   * @param {string} node
   * @param {string} account
   * @returns {Promise<any>}
   * @memberof Transaction
   */
  static async requestAccountTx(node: string, account: string): Promise<any> {
    return await requestAccountTx(node, account);
  }

  /**
   * 查看账户拥有的erc721 token
   *
   * @static
   * @param {string} node
   * @param {string} account
   * @returns {Promise<any>}
   * @memberof Transaction
   */
  static async requestAccountToken(node: string, account: string): Promise<any> {
    return await requestAccountToken(node, account);
  }

  /**
   * 获取erc721 token详情
   *
   * @static
   * @param {string} node
   * @param {string} tokenId erc721 id
   * @returns {Promise<any>}
   * @memberof Transaction
   */
  static async requestTokenInfo(node: string, tokenId: string): Promise<any> {
    return await requestTokenInfo(node, tokenId);
  }

  public static async sendRawTransaction(data: { blob: string; url: string }): Promise<string> {
    const { url, blob } = data;
    const res = await submitTransaction(url, blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res.result.tx_json.hash;
  }

  static isValidated(tx): boolean {
    const result = tx?.result;
    return result?.status === "success" && result?.validated;
  }

  protected getNode() {
    const node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    return node;
  }

  static isSuccess(tx): boolean {
    return tx?.result?.engine_result === "tesSUCCESS";
  }

  public setNodes(nodes: string[]) {
    this.nodes = nodes;
  }

  /**
   * create order
   *
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {string} amount amount of order
   * @param {(string | IToken)} base token name, if the transaction pair is jjcc-swt, the value of base is "jjcc"
   * @param {(string | IToken)} counter token name, if the transaction pair is jjcc-swt, the value of counter is "swt"
   * @param {string} sum the value is the amount multiplied by price
   * @param {ExchangeType} type the value is "buy" or "sell"
   * @param {string} platform platform address
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async createOrder(
    address: string,
    secret: string,
    amount: string,
    base: string | IToken,
    counter: string | IToken,
    sum: string,
    type: ExchangeType,
    platform: string
  ): Promise<string> {
    const tx = serializeCreateOrder(
      address,
      amount,
      base,
      counter,
      sum,
      type,
      platform,
      this.wallet.getCurrency(),
      this.wallet.getFee(),
      this.wallet.getIssuer()
    );
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * cancel order
   *
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {number} offerSequence sequence of order
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async cancelOrder(address: string, secret: string, offerSequence: number): Promise<string> {
    const tx = serializeCancelOrder(address, offerSequence, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * transfer token
   *
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {string} amount transfer amount
   * @param {(string | IMemo[])} memo transfer memo
   * @param {string} to destination address of jingtum wallet
   * @param {string} token token name of transfer
   * @param {string} [issuer] issuer address of token
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async transfer(
    address: string,
    secret: string,
    amount: string,
    memo: string | IMemo[],
    to: string,
    token: string,
    issuer?: string
  ): Promise<string> {
    const tx = serializePayment(
      address,
      amount,
      to,
      token,
      memo,
      this.wallet.getFee(),
      this.wallet.getCurrency(),
      issuer || this.wallet.getIssuer()
    );
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * set brokerage
   *
   * @param {string} platformAccount platform wallet address
   * @param {string} platformSecret platform wallet secret
   * @param {string} feeAccount fee wallet address
   * @param {number} rateNum fee numerator
   * @param {number} rateDen fee denominator
   * @param {string} token token name of transfer
   * @param {string} [issuer] issuer address of token
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async setBrokerage(
    platformAccount: string,
    platformSecret: string,
    feeAccount: string,
    rateNum: number,
    rateDen: number,
    token: string,
    issuer?: string
  ): Promise<string> {
    const tx = serializeBrokerage(
      platformAccount,
      feeAccount,
      rateNum,
      rateDen,
      token,
      issuer || this.wallet.getIssuer(),
      this.wallet.getFee()
    );
    const hash = await this.submit(platformSecret, tx);
    return hash;
  }

  /**
   * add blackList
   *
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account to be frozen wallet address
   * @param {(string | IMemo[])} memo memo
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async addBlackList(address: string, secret: string, account: string, memo: string | IMemo[]): Promise<string> {
    const tx = serializeSetBlackList(address, account, memo, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * remove blackList
   *
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account to be frozen wallet address
   * @param {(string | IMemo[])} memo memo
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async removeBlackList(
    address: string,
    secret: string,
    account: string,
    memo: string | IMemo[]
  ): Promise<string> {
    const tx = serializeRemoveBlackList(address, account, memo, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * set manage issuer
   *
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account new issuer wallet address
   * @param {(string | IMemo[])} memo memo
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async setManageIssuer(
    address: string,
    secret: string,
    account: string,
    memo: string | IMemo[]
  ): Promise<string> {
    const tx = serializeManageIssuer(address, account, memo, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * issueSet pre issue new token
   *
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} amount the max amount with pre issue
   * @param {(string | IMemo[])} memo memo
   * @param {string} token token name
   * @param {string} issuer issuer address of token
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async issueSet(
    address: string,
    secret: string,
    amount: string,
    memo: string | IMemo[],
    token: string,
    issuer: string
  ): Promise<string> {
    const tx = serializeIssueSet(address, amount, token, memo, issuer, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * enable/disable multi-sign account, signerQuorum is zero means disable
   *
   * @param {string} address multi-sign jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {number} signerQuorum threshold of voting
   * @param {ISignerEntry[]} signerEntries list of signer account and weight
   * @returns {Promise<string>} resolve hash if success
   * @memberof Transaction
   */
  public async setSignerList(
    address: string,
    secret: string,
    signerQuorum: number,
    signerEntries?: ISignerEntry[]
  ): Promise<string> {
    const tx = serializeSignerList(address, signerQuorum, this.wallet.getFee(), signerEntries);
    const hash = await this.submit(secret, tx);
    return hash;
  }

  public async setAccount(address: string, secret: string, disable: boolean): Promise<string> {
    const tx = serializeSetAccount(address, disable, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * 721转账
   *
   * @param {string} account
   * @param {string} secret
   * @param {string} receiver
   * @param {string} tokenId
   * @param {(string | IMemo[])} [memo]
   * @returns
   * @memberof Transaction
   */
  public async transfer721(
    account: string,
    secret: string,
    receiver: string,
    tokenId: string,
    memo?: string | IMemo[]
  ) {
    const tx = serialize721Payment(account, receiver, tokenId, this.wallet.getFee(), memo);
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * 删除721
   *
   * @param {string} account
   * @param {string} secret
   * @param {string} tokenId
   * @returns
   * @memberof Transaction
   */
  public async delete721(account: string, secret: string, tokenId: string) {
    const tx = serialize721Delete(account, tokenId, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * 设置发行权限
   *
   * buildTokenIssueTx
   *
   * @param {string} account
   * @param {string} secret
   * @param {string} publisher
   * @param {number} amount
   * @param {string} token
   * @param {TokenFlag} flag
   * @returns
   * @memberof Transaction
   */
  public async setTokenIssue(
    account: string,
    secret: string,
    publisher: string,
    amount: number,
    token: string,
    flag: TokenFlag
  ) {
    const tx = serializeTokenIssue(account, publisher, amount, token, flag, this.wallet.getFee());
    const hash = await this.submit(secret, tx);
    return hash;
  }

  /**
   * 发行721
   *
   * @param {string} account
   * @param {string} secret
   * @param {string} receiver
   * @param {string} token
   * @param {string} tokenId
   * @param {TokenInfo[]} [tokenInfos]
   * @returns
   * @memberof Transaction
   */
  public async publish721(
    account: string,
    secret: string,
    receiver: string,
    token: string,
    tokenId: string,
    tokenInfos?: TokenInfo[]
  ) {
    const tx = serialize721Publish(account, receiver, token, tokenId, this.wallet.getFee(), tokenInfos);
    const hash = await this.submit(secret, tx);
    return hash;
  }

  public async submit(secret: string, tx: any): Promise<string> {
    let hash;
    let retry = this.retry;
    const node = this.getNode();
    try {
      while (!hash) {
        // copy transaction because signature action will change origin transaction
        const copyTx = Object.assign({}, tx);
        const sequence = await swtcSequence.get(Transaction.fetchSequence, tx.Account, node);
        copyTx.Sequence = sequence;
        const signed = this.wallet.sign(copyTx, secret);
        const res = await submitTransaction(node, signed.blob);
        const engine_result = res?.result?.engine_result;
        if (engine_result === "tesSUCCESS") {
          hash = res.result.tx_json.hash;
        } else {
          if (engine_result !== "terPRE_SEQ" && engine_result !== "tefPAST_SEQ") {
            throw new Error(JSON.stringify(res));
          }
          retry = retry - 1;
          swtcSequence.reset(tx.Account);
          if (retry < 0) {
            throw new Error(JSON.stringify(res));
          }
        }
      }
      swtcSequence.rise(tx.Account);
      return hash;
    } catch (error) {
      swtcSequence.reset(tx.Account);
      throw error;
    }
  }
}
