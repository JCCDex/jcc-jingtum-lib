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
    const serializeTX = tx.serializePayment(
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

    expect(serializeTX).to.eql(tx_data.payment);
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
    expect(serializeTX).to.eql(tx_data.signerList);
  });

  it("serializeSetAccount", () => {
    const serializeTX = tx.serializeSetAccount(fromAccount.address, true, jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.setAccount);
  });

  it("serializeSetBlackList", () => {
    const serializeTX = tx.serializeSetBlackList(toAccount.address, fromAccount.address, "test", jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.setBlackList);
  });

  it("serializeRemoveBlackList", () => {
    const serializeTX = tx.serializeRemoveBlackList(fromAccount.address, toAccount.address, "test", jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.removeBlackList);
  });

  it("serializeManageIssuer", () => {
    const serializeTX = tx.serializeManageIssuer(toAccount.address, fromAccount.address, "test", jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.manageIssuer);
  });

  it("serializeIssueSet", () => {
    const serializeTX = tx.serializeIssueSet(
      fromAccount.address,
      "100000",
      "TNT",
      "test",
      jingtum.getIssuer(),
      jingtum.getFee()
    );
    expect(serializeTX).to.eql(tx_data.issueSet);
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
    expect(serializeTX).to.eql(tx_data.publish721);
  });

  it("serialize721Payment", () => {
    const serializeTX = tx.serialize721Payment(fromAccount.address, toAccount.address, "123", jingtum.getFee(), "test");
    expect(serializeTX).to.eql(tx_data.payment721);
  });

  it("serialize721Delete", () => {
    const serializeTX = tx.serialize721Delete(fromAccount.address, "123", jingtum.getFee());
    expect(serializeTX).to.eql(tx_data.delete721);
  });

  it("serializeTrustSet", () => {
    const serializeTX = tx.serializeTrustSet(
      fromAccount.address,
      {
        currency: "CNY",
        issuer: jingtum.getIssuer(),
        value: "10000"
      },
      "test",
      jingtum.getFee()
    );
    expect(serializeTX).to.eql(tx_data.trustSet);
  });
});
