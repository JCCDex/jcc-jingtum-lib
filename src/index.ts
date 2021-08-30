import { jtWallet } from "jcc_wallet";
import { fetchSequence, fetchTransaction, submitTransaction } from "./rpc";
import { Tx, sign } from "jcc_exchange";

export interface IPayment {
  address: string;
  secret: string;
  to: string;
  token: string;
  amount: string;
  memo?: string;
  issuer?: string;
}

export default class JccJingtum {
  private nodes: string[];

  constructor(nodes: string[]) {
    this.nodes = nodes;
  }

  static getAddress(secret: string): string {
    return jtWallet.getAddress(secret);
  }

  static isValidAddress(address: string): boolean {
    return jtWallet.isValidAddress(address);
  }

  static isValidSecret(secret: string): boolean {
    return jtWallet.isValidSecret(secret);
  }

  static createWallet(): IWalletModel {
    return jtWallet.createWallet();
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

  public async fetchTransaction(hash: string) {
    let tx = null;
    for (const node of this.nodes) {
      try {
        const res = await JccJingtum.fetchTransaction(node, hash);
        if (JccJingtum.isValidated(res)) {
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
    const tx = Tx.serializePayment(
      address,
      amount,
      to,
      token,
      memo || "",
      issuer || "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
    );
    const copyTx: IPayExchange = Object.assign({}, tx);
    const rpcNode = this.getNode();
    const sequence = await JccJingtum.fetchSequence(rpcNode, address);
    copyTx.Sequence = sequence;
    const blob = sign(copyTx, secret);
    const res = await submitTransaction(rpcNode, blob);
    if (!JccJingtum.isSuccess(res)) {
      throw new Error(JSON.stringify(res));
    }
    return res;
  }
}
