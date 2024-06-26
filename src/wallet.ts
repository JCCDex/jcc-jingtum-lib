import { IWallet, Factory as WalletFactory } from "@swtc/wallet";
import { Factory as SerializerFactory } from "@swtc/serializer";
import { HASHPREFIX, SM3, convertStringToHex } from "@swtc/common";
import BigNumber from "bignumber.js";
import { AbstractWallet, ChainOption, ISupportChain, SignResult } from "./type";

const createHash = require("create-hash");
const cloneDeep = require("lodash.clonedeep");

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

export class Wallet extends AbstractWallet {
  public readonly wallet;
  protected readonly serializer;
  protected readonly sha256: (bytes: string | Uint8Array) => string;
  constructor(chain: ISupportChain | ChainOption) {
    super();
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

  public createWallet(): IWallet {
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

  public sign(tx, secret: string): SignResult {
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

  public multiSign(tx, secret: string) {
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
