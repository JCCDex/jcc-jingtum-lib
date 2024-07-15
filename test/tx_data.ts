export const createOrder_buy = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 0,
  Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
  TakerGets: "0.4",
  TakerPays: "1",
  TransactionType: "OfferCreate"
};

export const createOrder_buy_2 = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 0,
  Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
  TakerGets: {
    currency: "JJCC",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "0.4"
  },
  TakerPays: {
    currency: "CNY",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "1"
  },
  TransactionType: "OfferCreate"
};

export const createOrder_sell = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 524288,
  Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
  TakerGets: {
    currency: "CNY",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "1"
  },
  TakerPays: {
    currency: "JJCC",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "0.4"
  },
  TransactionType: "OfferCreate"
};

export const createOrder_sell_2 = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 524288,
  Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
  TakerGets: "1",
  TakerPays: "0.4",
  TransactionType: "OfferCreate"
};

export const cancelOrder = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 0,
  OfferSequence: 1,
  TransactionType: "OfferCancel"
};

export const payment_1 = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Amount: "7500000",
  Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "123",
        MemoType: "hex"
      }
    }
  ],
  TransactionType: "Payment"
};

export const payment_2 = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Amount: {
    currency: "TNT",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "7500000"
  },
  Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "123",
        MemoType: "hex"
      }
    }
  ],
  TransactionType: "Payment"
};

export const brokerage = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Amount: {
    currency: "CNY",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "0"
  },
  Fee: 0.01,
  FeeAccountID: "10",
  OfferFeeRateDen: 10000,
  OfferFeeRateNum: 10000,
  TransactionType: "Brokerage"
};

export const signerList = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  SignerQuorum: 10,
  SignerEntries: [
    {
      SignerEntry: {
        Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
        SignerWeight: 300
      }
    }
  ],
  Fee: 0.01,
  TransactionType: "SignerListSet"
};

export const signerList_zero = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  SignerQuorum: 0,
  Fee: 0.01,
  TransactionType: "SignerListSet"
};

export const setAccount_true = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  SetFlag: 4,
  Fee: 0.01,
  TransactionType: "AccountSet"
};

export const setAccount_false = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  ClearFlag: 4,
  Fee: 0.01,
  TransactionType: "AccountSet"
};

export const setBlackList = {
  Account: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  BlackListAccountID: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ],
  TransactionType: "SetBlackList"
};

export const removeBlackList = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  BlackListAccountID: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ],
  TransactionType: "RemoveBlackList"
};

export const manageIssuer = {
  Account: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  IssuerAccountID: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ],
  TransactionType: "ManageIssuer"
};

export const issueSet = {
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  TotalAmount: {
    currency: "TNT",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "100000"
  },
  Fee: 0.01,
  Flags: 0,
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ],
  TransactionType: "IssueSet"
};

export const tokenIssue = {
  TransactionType: "TokenIssue",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.000001,
  FundCode: "544e54",
  TokenSize: 1000,
  Issuer: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  Flags: 1
};

export const publish721 = {
  TransactionType: "TransferToken",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  TokenID: "123",
  Fee: 0.01,
  Flags: 0,
  FundCode: "544e54",
  TokenInfos: [
    {
      TokenInfo: {
        InfoType: "737472696e67",
        InfoData: "535754"
      }
    }
  ]
};

export const publish721_noInfos = {
  TransactionType: "TransferToken",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  TokenID: "123",
  Fee: 0.01,
  Flags: 0,
  FundCode: "544e54"
};

export const payment721 = {
  TransactionType: "TransferToken",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
  TokenID: "123",
  Fee: 0.01,
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ]
};

export const delete721 = {
  TransactionType: "TokenDel",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  Fee: 0.01,
  TokenID: "123"
};

export const trustSet = {
  Flags: 0,
  Fee: 0.01,
  TransactionType: "TrustSet",
  Account: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM",
  LimitAmount: {
    currency: "CNY",
    issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
    value: "10000"
  },
  Memos: [
    {
      Memo: {
        MemoData: "test",
        MemoType: "string"
      }
    }
  ]
};
