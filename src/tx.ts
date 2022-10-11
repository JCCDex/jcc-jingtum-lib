import {
  ExchangeType,
  ICancelExchange,
  ICreateExchange,
  IMemo,
  IPayExchange,
  IToken,
  IAmount,
  IBrokerageExchange,
  ISignerEntry,
  ISignerListSet,
  IAccountSet,
  IBlackList,
  IManageIssuer,
  IIssueSet,
  TokenFlag,
  TokenInfo
} from "./type";

import { funcStringToHex as string2hex } from "@swtc/common";
const utf8 = require("utf8");

export const serializeCreateOrder = (
  address: string,
  amount: string,
  base: string | IToken,
  counter: string | IToken,
  sum: string,
  type: ExchangeType,
  platform: string,
  nativeCurrency: string,
  fee: number,
  issuer: string
): ICreateExchange => {
  const account = address;
  let takerGets;
  let takerPays;
  let flags;
  let baseName: string;
  let baseIssuer: string;
  let counterName: string;
  let counterIssuer: string;
  if (typeof base === "object") {
    baseName = base.name;
    baseIssuer = base.issuer || issuer;
  } else {
    baseName = base;
    baseIssuer = issuer;
  }
  if (typeof counter === "object") {
    counterName = counter.name;
    counterIssuer = counter.issuer || issuer;
  } else {
    counterName = counter;
    counterIssuer = issuer;
  }
  if (type === "buy") {
    flags = 0;
    if (baseName.toUpperCase() === nativeCurrency) {
      takerPays = amount;
    } else {
      takerPays = {
        currency: baseName.toUpperCase(),
        issuer: baseIssuer,
        value: amount
      };
    }

    if (counterName.toUpperCase() === nativeCurrency) {
      takerGets = sum;
    } else {
      takerGets = {
        currency: counterName.toUpperCase(),
        issuer: counterIssuer,
        value: sum
      };
    }
  } else if (type === "sell") {
    flags = 0x00080000;

    if (counterName.toUpperCase() === nativeCurrency) {
      takerPays = sum;
    } else {
      takerPays = {
        currency: counterName.toUpperCase(),
        issuer: counterIssuer,
        value: sum
      };
    }

    if (baseName.toUpperCase() === nativeCurrency) {
      takerGets = amount;
    } else {
      takerGets = {
        currency: baseName.toUpperCase(),
        issuer: baseIssuer,
        value: amount
      };
    }
  } else {
    throw new Error("The type of creating order should be one of 'buy' and 'sell'");
  }
  const tx = {
    Account: account,
    Fee: fee / 1000000,
    Flags: flags,
    Platform: platform || "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
    TakerGets: takerGets,
    TakerPays: takerPays,
    TransactionType: "OfferCreate"
  };
  return tx;
};

export const serializeCancelOrder = (address: string, sequence: number, fee: number): ICancelExchange => {
  const tx = {
    Account: address,
    Fee: fee / 1000000,
    Flags: 0,
    OfferSequence: sequence,
    TransactionType: "OfferCancel"
  };
  return tx;
};

export const serializePayment = (
  address: string,
  amount: string,
  to: string,
  token: string,
  memo: string | IMemo[],
  fee: number,
  nativeCurrency: string,
  issuer: string
): IPayExchange => {
  let _amount: IAmount | string;

  if (token.toUpperCase() === nativeCurrency) {
    _amount = amount;
  } else {
    _amount = {
      currency: token.toUpperCase(),
      issuer,
      value: amount
    };
  }

  let memos: IMemo[];

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
};

export const serializeBrokerage = (
  platformAccount: string,
  feeAccount: string,
  rateNum: number,
  rateDen: number,
  token: string,
  issuer: string,
  fee: number
): IBrokerageExchange => {
  const amount = {
    currency: token.toUpperCase(),
    issuer,
    value: "0"
  };

  const tx = {
    Account: platformAccount,
    Amount: amount,
    Fee: fee / 1000000,
    FeeAccountID: feeAccount,
    OfferFeeRateDen: rateDen,
    OfferFeeRateNum: rateNum,
    TransactionType: "Brokerage"
  };

  return tx;
};

export const serializeSignerList = (
  account: string,
  signerQuorum: number,
  fee: number,
  signerEntries?: ISignerEntry[]
): ISignerListSet => {
  const tx = signerQuorum
    ? {
        Account: account,
        SignerQuorum: signerQuorum,
        SignerEntries: signerEntries,
        Fee: fee / 1000000,
        TransactionType: "SignerListSet"
      }
    : {
        Account: account,
        SignerQuorum: 0,
        Fee: fee / 1000000,
        TransactionType: "SignerListSet"
      };

  return tx;
};

export const serializeSetAccount = (account: string, disable: boolean, fee: number): IAccountSet => {
  const tx = disable
    ? {
        Account: account,
        SetFlag: 4,
        Fee: fee / 1000000,
        TransactionType: "AccountSet"
      }
    : {
        Account: account,
        ClearFlag: 4,
        Fee: fee / 1000000,
        TransactionType: "AccountSet"
      };

  return tx;
};

export const serializeSetBlackList = (
  manager: string,
  account: string,
  memo: string | IMemo[],
  fee: number
): IBlackList => {
  let memos: IMemo[];

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
    Account: manager,
    BlackListAccountID: account,
    Fee: fee / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "SetBlackList"
  };

  return tx;
};

export const serializeRemoveBlackList = (
  manager: string,
  account: string,
  memo: string | IMemo[],
  fee: number
): IBlackList => {
  let memos: IMemo[];

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
    Account: manager,
    BlackListAccountID: account,
    Fee: fee / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "RemoveBlackList"
  };

  return tx;
};

export const serializeManageIssuer = (
  manager: string,
  account: string,
  memo: string | IMemo[],
  fee: number
): IManageIssuer => {
  let memos: IMemo[];

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
    Account: manager,
    IssuerAccountID: account,
    Fee: fee / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "ManageIssuer"
  };

  return tx;
};

export const serializeIssueSet = (
  manager: string,
  amount: string,
  token: string,
  memo: string | IMemo[],
  issuer: string,
  fee: number
): IIssueSet => {
  let memos: IMemo[];

  const _amount = {
    currency: token.toUpperCase(),
    issuer,
    value: amount
  };

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
    Account: manager,
    TotalAmount: _amount,
    Fee: fee / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "IssueSet"
  };

  return tx;
};

export const serializeTokenIssue = (
  account: string,
  publisher: string,
  amount: number,
  token: string,
  flag: TokenFlag,
  fee: number
) => {
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
};

export const serialize721Publish = (
  address: string,
  to: string,
  token: string,
  tokenId: string,
  fee: number,
  infos?: TokenInfo[]
) => {
  const tx: any = {
    TransactionType: "TransferToken",
    Account: address,
    Destination: to,
    TokenID: tokenId,
    Fee: fee / 1000000,
    Flags: 0,
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
};

export const serialize721Payment = (
  address: string,
  to: string,
  tokenId: string,
  fee: number,
  memo: string | IMemo[]
) => {
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
    TokenID: tokenId.toUpperCase(),
    Fee: fee / 1000000,
    Memos: memos
  };
  return tx;
};

export const serialize721Delete = (address: string, tokenId: string, fee: number) => {
  const tx = {
    TransactionType: "TokenDel",
    Account: address,
    Fee: fee / 1000000,
    TokenID: tokenId
  };
  return tx;
};

/**
 * 设置资产接收上限
 *
 * @param {string} address
 * @param {(IAmount | string)} limit
 * @param {(string | IMemo[])} memo
 * @param {number} fee
 * @returns
 */
export const serializeTrustSet = (address: string, limit: IAmount | string, memo: string | IMemo[], fee: number) => {
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
    Flags: 0,
    Fee: fee / 1000000,
    TransactionType: "TrustSet",
    Account: address,
    LimitAmount: limit,
    Memos: memos
  };
  return tx;
};
