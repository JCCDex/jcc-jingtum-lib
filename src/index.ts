import { Factory as WalletFactory } from "@swtc/wallet";
import { Factory as SerializerFactory } from "@swtc/serializer";
import { HASHPREFIX, funcStringToHex as string2hex } from "@swtc/common";
import { fetchSequence, fetchTransaction, submitTransaction } from "./rpc";
const utf8 = require("utf8");
export interface IPayment {
  address: string;
  secret: string;
  to: string;
  token: string;
  amount: string;
  memo?: string;
  issuer?: string;
}

export interface IPayment721 {
  /**
   * erc721拥有者账号
   *
   * @type {string}
   * @memberof IPayment721
   */
  publisher: string;
  /**
   * erc721拥有者密钥
   *
   * @type {string}
   * @memberof IPayment721
   */
  secret: string;
  /**
   * 接收erc721账号
   *
   * @type {string}
   * @memberof IPayment721
   */
  receiver: string;
  /**
   * erc721唯一标识， hash256格式
   *
   * @type {string}
   * @memberof IPayment721
   */
  tokenId: string;
  /**
   * 转账备注
   *
   * @type {string}
   * @memberof IPayment721
   */
  memo?: string;
}

interface TokenInfo {
  type: string;
  data: string;
}

export interface I721Publish {
  /**
   * erc721拥有者账号
   *
   * @type {string}
   * @memberof IPayment721
   */
  publisher: string;
  /**
   * erc721拥有者密钥
   *
   * @type {string}
   * @memberof IPayment721
   */
  secret: string;
  /**
   * 接收erc721账号
   *
   * @type {string}
   * @memberof IPayment721
   */
  receiver: string;
  /**
   * erc721唯一标识， hash256格式
   *
   * @type {string}
   * @memberof IPayment721
   */
  tokenId: string;
  /**
   * 转账备注
   *
   * @type {string}
   * @memberof IPayment721
   */

  /**
   * token名称
   *
   * @type {string}
   * @memberof I721Publish
   */
  token: string;

  /**
   * token信息
   *
   * @type {TokenInfo[]}
   * @memberof I721Publish
   */
  tokenInfos?: TokenInfo[];
}

enum TokenFlag {
  /**
   * 可流通
   */
  CIRCULATION = 0,

  /**
   * 不可流通
   */
  NON_CIRCULATION = 1
}

export interface ITokenIssue {
  /**
   * 动态发币账号
   *
   * @type {string}
   * @memberof ITokenIssue
   */
  account: string;

  /**
   * 动态发币密钥
   *
   * @type {string}
   * @memberof ITokenIssue
   */
  secret: string;

  /**
   * 721token的发行账号
   *
   * @type {string}
   * @memberof ITokenIssue
   */
  publisher: string;
  /**
   * 721token的发行名称
   *
   * @type {string}
   * @memberof ITokenIssue
   */
  token: string;
  /**
   * 721token发行的数量
   *
   * @type {number}
   * @memberof ITokenIssue
   */
  amount: number;
  /**
   * Token是否流通标志位，0表示可以流通，非0表示不可以流通。
   *
   * @type {TokenFlag}
   * @memberof ITokenIssue
   */
  flag: TokenFlag;
}

export interface IDelete721 {
  /**
   * erc721拥有者账号
   *
   * @type {string}
   * @memberof IDelete721
   */
  publisher: string;
  /**
   *  erc721拥有者密钥
   *
   * @type {string}
   * @memberof IDelete721
   */
  secret: string;
  /**
   * erc721唯一标识， hash256格式
   *
   * @type {string}
   * @memberof IDelete721
   */
  tokenId: string;
}

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

export class Wallet {
  protected readonly wallet;
  protected readonly serializer;

  constructor(chain: string | ChainOption) {
    this.wallet = WalletFactory(chain);
    this.serializer = SerializerFactory(this.wallet);
  }

  public getAddress(secret: string): string {
    const wallet = this.wallet.fromSecret(secret);
    return wallet.address;
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
      hash,
      blob: sendBlob.to_hex()
    };
  }
}

export class Transaction extends Wallet {
  private nodes: string[];

  constructor(chain: string | ChainOption, nodes: string[]) {
    super(chain);
    this.nodes = nodes;
  }

  static async fetchSequence(node: string, address: string): Promise<number> {
    return await fetchSequence(node, address);
  }

  static async fetchTransaction(node: string, hash: string): Promise<any> {
    return fetchTransaction(node, hash);
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

  public buildPayment(address: string, amount: string, to: string, token: string, memo, issuer) {
    let _amount;
    const fee = this.wallet.getFee();
    const currency = this.wallet.getCurrency();
    if (token.toUpperCase() === currency) {
      _amount = amount;
    } else {
      _amount = {
        currency: token.toUpperCase(),
        issuer,
        value: amount
      };
    }

    let memos;
    if (typeof memo === "string") {
      memos = [
        {
          Memo: {
            MemoData: memo,
            MemoType: "string"
          }
        }
      ];
    } else {
      memos = memo;
    }

    const tx = {
      Account: address,
      Amount: _amount,
      Destination: to,
      Fee: fee / 1000000,
      Flags: 0,
      Memos: memos,
      TransactionType: "Payment"
    };

    return tx;
  }

  public build721Payment(address: string, to: string, token: string, memo) {
    const fee = this.wallet.getFee();
    let memos;
    if (typeof memo === "string") {
      memos = [
        {
          Memo: {
            MemoData: memo,
            MemoType: "string"
          }
        }
      ];
    } else {
      memos = memo;
    }
    const tx = {
      TransactionType: "TransferToken",
      Account: address,
      Destination: to,
      TokenID: token.toUpperCase(),
      Fee: fee / 1000000,
      Memos: memos
    };
    return tx;
  }

  public build721Delete(address: string, tokenId: string) {
    const fee = this.wallet.getFee();
    const tx = {
      TransactionType: "TokenDel",
      Account: address,
      Fee: fee / 1000000,
      TokenID: tokenId
    };
    return tx;
  }

  public async fetchTransaction(hash: string) {
    let tx = null;
    for (const node of this.nodes) {
      try {
        const res = await Transaction.fetchTransaction(node, hash);
        if (Transaction.isValidated(res)) {
          tx = res;
          break;
        }
      } catch (error) {
        console.log("fetch error: ", error.message, ", node is: ", node);
      }
    }

    if (tx === null) {
      throw new Error("fetch transaction failed, hash is: " + hash);
    }
    return tx;
  }

  public async payment(data: IPayment) {
    const { address, secret, to, amount, token, issuer, memo } = data;
    const tx = this.buildPayment(
      address,
      amount,
      to,
      token,
      memo || "",
      issuer || "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
    );
    const copyTx: any = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await Transaction.fetchSequence(rpcNode, address);
    copyTx.Sequence = sequence;
    const sign = this.sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, sign.blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }

  /**
   * 721转账
   *
   * @param {IPayment721} data
   * @returns
   * @memberof Transaction
   */
  public async payment721(data: IPayment721) {
    const { publisher, receiver, tokenId, secret, memo } = data;

    const tx = this.build721Payment(publisher, receiver, tokenId, memo);
    const copyTx: any = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await Transaction.fetchSequence(rpcNode, publisher);
    copyTx.Sequence = sequence;

    const sign = this.sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, sign.blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }

  /**
   * 删除721
   *
   * @param {IDelete721} data
   * @returns
   * @memberof Transaction
   */
  public async delete721(data: IDelete721) {
    const { publisher, tokenId, secret } = data;

    const tx = this.build721Delete(publisher, tokenId);
    const copyTx: any = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await Transaction.fetchSequence(rpcNode, publisher);
    copyTx.Sequence = sequence;

    const sign = this.sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, sign.blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }

  public buildTokenIssue(account: string, publisher: string, amount: number, token: string, flag: TokenFlag) {
    const fee = this.wallet.getFee();
    const tx = {
      TransactionType: "TokenIssue",
      Account: account,
      Fee: fee / 1000000,
      FundCode: string2hex(utf8.encode(token)),
      TokenSize: amount,
      Issuer: publisher,
      Flags: flag
    };
    return tx;
  }

  /**
   * 设置发行权限
   *
   * @param {ITokenIssue} data
   * @returns
   * @memberof Transaction
   */
  public async setTokenIssue(data: ITokenIssue) {
    const { publisher, account, secret, amount, flag, token } = data;

    const tx = this.buildTokenIssue(account, publisher, amount, token, flag);
    const copyTx: any = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await Transaction.fetchSequence(rpcNode, publisher);
    copyTx.Sequence = sequence;

    const sign = this.sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, sign.blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }

  public build721Publish(address: string, to: string, token: string, tokenId: string, infos?: TokenInfo[]) {
    const fee = this.wallet.getFee();
    const tx: any = {
      TransactionType: "TransferToken",
      Account: address,
      Destination: to,
      TokenID: tokenId,
      Fee: fee / 1000000,
      FundCode: string2hex(utf8.encode(token))
    };
    const ms = [];
    if (Array.isArray(infos) && infos.length > 0) {
      for (const info of infos) {
        ms.push({
          TokenInfo: { InfoType: string2hex(utf8.encode(info.type)), InfoData: string2hex(utf8.encode(info.data)) }
        });
      }
    }
    if (ms.length > 0) {
      tx.TokenInfos = ms;
    }

    return tx;
  }

  /**
   * 发行721
   *
   * @param {I721Publish} data
   * @returns
   * @memberof Transaction
   */
  public async publish721(data: I721Publish) {
    const { publisher, secret, token, tokenId, tokenInfos, receiver } = data;

    const tx = this.build721Publish(publisher, receiver, token, tokenId, tokenInfos);
    const copyTx: any = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await Transaction.fetchSequence(rpcNode, publisher);
    copyTx.Sequence = sequence;

    const sign = this.sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, sign.blob);
    if (!Transaction.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }
}
