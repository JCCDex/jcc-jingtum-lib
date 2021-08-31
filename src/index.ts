import { Factory as WalletFactory } from "@swtc/wallet";
import { Factory as SerializerFactory } from "@swtc/serializer";
import { HASHPREFIX } from "@swtc/common";

import { fetchSequence, fetchTransaction, submitTransaction } from "./rpc";

export interface IPayment {
  address: string;
  secret: string;
  to: string;
  token: string;
  amount: string;
  memo?: string;
  issuer?: string;
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
}
