export interface ITakerGets {
  currency: string;
  issuer: string;
  value: string;
}

export interface ITakerPays {
  currency: string;
  issuer: string;
  value: string;
}

export interface IAmount {
  currency: string;
  issuer: string;
  value: string;
}

export type ExchangeType = "buy" | "sell";

export interface IMemo {
  Memo: {
    MemoType: string;
    MemoData: string;
  };
}

export interface ISignerEntry {
  SignerEntry: {
    Account: string;
    SignerWeight: number;
  };
}

export interface ICreateExchange {
  Account: string;
  Fee: number;
  Flags: number;
  Platform: string;
  Sequence?: number;
  TakerGets: string | ITakerGets;
  TakerPays: string | ITakerPays;
  TransactionType: string;
}

export interface ICancelExchange {
  Account: string;
  Fee: number;
  Flags: number;
  OfferSequence: number;
  Sequence?: number;
  TransactionType: string;
}

export interface IPayExchange {
  Account: string;
  Amount: string | IAmount;
  Destination: string;
  Fee: number;
  Flags: number;
  Sequence?: number;
  TransactionType: string;
  Memos: IMemo[];
}

export interface ISignerListSet {
  Account: string;
  SignerQuorum: number;
  SignerEntries?: ISignerEntry[];
  Fee: number;
  Sequence?: number;
  TransactionType: string;
}

export interface IAccountSet {
  Account: string;
  SetFlag?: number;
  ClearFlag?: number;
  Fee: number;
  Sequence?: number;
  TransactionType: string;
}

export interface IBrokerageExchange {
  Account: string;
  Amount: string | IAmount;
  Fee: number;
  FeeAccountID: string;
  OfferFeeRateDen: number;
  OfferFeeRateNum: number;
  Sequence?: number;
  TransactionType: string;
}

export type ISupportChain = "jingtum" | "bizain" | "seaaps";

export interface IChainConfig {
  nativeToken: string;
  minGas: number;
}

export interface IToken {
  name: string;
  issuer?: string;
}

export interface IBlackList {
  Account: string;
  Fee: number;
  Flags: number;
  Sequence?: number;
  BlackListAccountID?: string;
  TransactionType: string;
  Memos: IMemo[];
}

export interface IIssueSet {
  Account: string;
  Fee: number;
  Flags: number;
  Sequence?: number;
  TransactionType: string;
  TotalAmount: string | IAmount;
  Memos: IMemo[];
}

export interface IManageIssuer {
  Account: string;
  Fee: number;
  Flags: number;
  Sequence?: number;
  IssuerAccountID: string;
  TransactionType: string;
  Memos: IMemo[];
}

export enum TokenFlag {
  /**
   * 可流通
   */
  CIRCULATION = 0,

  /**
   * 不可流通
   */
  NON_CIRCULATION = 1
}

export interface TokenInfo {
  type: string;
  data: string;
}
