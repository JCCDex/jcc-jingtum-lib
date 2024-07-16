import * as tx from "../src/tx";
import { Wallet, TokenFlag } from "../src";
import * as tx_data from "./tx_data";
import { expect } from "chai";

describe("tx", () => {
  const jingtum = new Wallet("jingtum");
  const toAccount = {
    secret: "sshGrW6mFqRD2xyk7GwBF4avaFeWB",
    address: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK"
  };
  const fromAccount = {
    secret: "ssVayvayrW6bRR1aZZWnHVfZmutco",
    address: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM"
  };
  it("serializeCreateOrder", () => {
    const serializeTX_buy = tx.serializeCreateOrder(
      fromAccount.address,
      "1",
      {
        name: "SWT",
        issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
      },
      {
        name: "SWT",
        issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
      },
      "0.4",
      "buy",
      "",
      "SWT",
      jingtum.getFee(),
      jingtum.getIssuer()
    );
    const serializeTX_buy_2 = tx.serializeCreateOrder(
      fromAccount.address,
      "1",
      "CNY",
      "JJCC",
      "0.4",
      "buy",
      "",
      "SWT",
      jingtum.getFee(),
      jingtum.getIssuer()
    );
    const serializeTX_sell = tx.serializeCreateOrder(
      fromAccount.address,
      "1",
      "CNY",
      "JJCC",
      "0.4",
      "sell",
      "",
      "SWT",
      jingtum.getFee(),
      jingtum.getIssuer()
    );
    const serializeTX_sell_2 = tx.serializeCreateOrder(
      fromAccount.address,
      "1",
      "SWT",
      "SWT",
      "0.4",
      "sell",
      "",
      "SWT",
      jingtum.getFee(),
      jingtum.getIssuer()
    );
    expect(serializeTX_buy).to.eql(tx_data.createOrder_buy);
    expect(serializeTX_buy_2).to.eql(tx_data.createOrder_buy_2);
    expect(serializeTX_sell).to.eql(tx_data.createOrder_sell);
    expect(serializeTX_sell_2).to.eql(tx_data.createOrder_sell_2);
  });

  it("serializeCancelOrder", () => {
    const serializeTX = tx.serializeCancelOrder(fromAccount.address, 1, jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.cancelOrder);
  });

  it("serializePayment", () => {
    const serializeTX_1 = tx.serializePayment(
      fromAccount.address,
      "7500000",
      toAccount.address,
      "SWT",
      [
        {
          Memo: {
            MemoData: "123",
            MemoType: "hex"
          }
        }
      ],
      jingtum.getFee(),
      "SWT",
      jingtum.getIssuer()
    );
    const serializeTX_2 = tx.serializePayment(
      fromAccount.address,
      "7500000",
      toAccount.address,
      "TNT",
      [
        {
          Memo: {
            MemoData: "123",
            MemoType: "hex"
          }
        }
      ],
      jingtum.getFee(),
      "SWT",
      jingtum.getIssuer()
    );

    expect(serializeTX_1).to.eql(tx_data.payment_1);
    expect(serializeTX_2).to.eql(tx_data.payment_2);
  });

  it("serializeBrokerage", () => {
    const serializeTX = tx.serializeBrokerage(
      fromAccount.address,
      "10",
      10000,
      10000,
      "CNY",
      jingtum.getIssuer(),
      jingtum.getFee()
    );
    expect(serializeTX).to.eql(tx_data.brokerage);
  });

  it("serializeSignerList", () => {
    const serializeTX = tx.serializeSignerList(fromAccount.address, 10, jingtum.getFee(), [
      {
        SignerEntry: {
          Account: fromAccount.address,
          SignerWeight: 300
        }
      }
    ]);
    const serializeTX_zero = tx.serializeSignerList(fromAccount.address, 0, jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.signerList);
    expect(serializeTX_zero).to.eql(tx_data.signerList_zero);
  });

  it("serializeSetAccount", () => {
    const serializeTX_true = tx.serializeSetAccount(fromAccount.address, true, jingtum.getFee());
    const serializeTX_false = tx.serializeSetAccount(fromAccount.address, false, jingtum.getFee());
    expect(serializeTX_true).to.eql(tx_data.setAccount_true);
    expect(serializeTX_false).to.eql(tx_data.setAccount_false);
  });

  it("serializeSetBlackList", () => {
    const serializeTX_1 = tx.serializeSetBlackList(toAccount.address, fromAccount.address, "test", jingtum.getFee());
    const serializeTX_2 = tx.serializeSetBlackList(
      toAccount.address,
      fromAccount.address,
      [{ Memo: { MemoData: "test", MemoType: "string" } }],
      jingtum.getFee()
    );
    expect(serializeTX_1).to.eql(tx_data.setBlackList);
    expect(serializeTX_2).to.eql(tx_data.setBlackList);
  });

  it("serializeRemoveBlackList", () => {
    const serializeTX_1 = tx.serializeRemoveBlackList(fromAccount.address, toAccount.address, "test", jingtum.getFee());
    const serializeTX_2 = tx.serializeRemoveBlackList(
      fromAccount.address,
      toAccount.address,
      [{ Memo: { MemoData: "test", MemoType: "string" } }],
      jingtum.getFee()
    );
    expect(serializeTX_1).to.eql(tx_data.removeBlackList);
    expect(serializeTX_2).to.eql(tx_data.removeBlackList);
  });

  it("serializeManageIssuer", () => {
    const serializeTX_1 = tx.serializeManageIssuer(toAccount.address, fromAccount.address, "test", jingtum.getFee());
    const serializeTX_2 = tx.serializeManageIssuer(
      toAccount.address,
      fromAccount.address,
      [{ Memo: { MemoData: "test", MemoType: "string" } }],
      jingtum.getFee()
    );
    expect(serializeTX_1).to.eql(tx_data.manageIssuer);
    expect(serializeTX_2).to.eql(tx_data.manageIssuer);
  });

  it("serializeIssueSet", () => {
    const serializeTX_1 = tx.serializeIssueSet(
      fromAccount.address,
      "100000",
      "TNT",
      "test",
      jingtum.getIssuer(),
      jingtum.getFee()
    );
    const serializeTX_2 = tx.serializeIssueSet(
      fromAccount.address,
      "100000",
      "TNT",
      [{ Memo: { MemoData: "test", MemoType: "string" } }],
      jingtum.getIssuer(),
      jingtum.getFee()
    );
    expect(serializeTX_1).to.eql(tx_data.issueSet);
    expect(serializeTX_2).to.eql(tx_data.issueSet);
  });

  it("serializeTokenIssue", () => {
    const serializeTX = tx.serializeTokenIssue(
      fromAccount.address,
      toAccount.address,
      1000,
      "TNT",
      TokenFlag.NON_CIRCULATION,
      1
    );
    expect(serializeTX).to.eql(tx_data.tokenIssue);
  });

  it("serialize721Publish", () => {
    const serializeTX = tx.serialize721Publish(fromAccount.address, toAccount.address, "TNT", "123", jingtum.getFee(), [
      {
        type: "string",
        data: "SWT"
      }
    ]);
    const serializeTX_noInfos = tx.serialize721Publish(
      fromAccount.address,
      toAccount.address,
      "TNT",
      "123",
      jingtum.getFee()
    );
    expect(serializeTX).to.eql(tx_data.publish721);
    expect(serializeTX_noInfos).to.eql(tx_data.publish721_noInfos);
  });

  it("serialize721Payment", () => {
    const serializeTX_1 = tx.serialize721Payment(
      fromAccount.address,
      toAccount.address,
      "123",
      jingtum.getFee(),
      "test"
    );
    const serializeTX_2 = tx.serialize721Payment(fromAccount.address, toAccount.address, "123", jingtum.getFee(), [
      { Memo: { MemoData: "test", MemoType: "string" } }
    ]);
    expect(serializeTX_1).to.eql(tx_data.payment721);
    expect(serializeTX_2).to.eql(tx_data.payment721);
  });

  it("serialize721Delete", () => {
    const serializeTX = tx.serialize721Delete(fromAccount.address, "123", jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.delete721);
  });

  it("serializeTrustSet", () => {
    const serializeTX_1 = tx.serializeTrustSet(
      fromAccount.address,
      {
        currency: "CNY",
        issuer: jingtum.getIssuer(),
        value: "10000"
      },
      "test",
      jingtum.getFee()
    );
    const serializeTX_2 = tx.serializeTrustSet(
      fromAccount.address,
      {
        currency: "CNY",
        issuer: jingtum.getIssuer(),
        value: "10000"
      },
      [{ Memo: { MemoData: "test", MemoType: "string" } }],
      jingtum.getFee()
    );
    expect(serializeTX_1).to.eql(tx_data.trustSet);
    expect(serializeTX_2).to.eql(tx_data.trustSet);
  });
});
