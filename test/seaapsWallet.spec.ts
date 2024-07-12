import { AbstractWallet, serializePayment, Wallet } from "../src";

describe("seaaps", () => {
  it("constructor", () => {
    const seaaps = new Wallet("seaaps");
    expect(seaaps).toBeInstanceOf(AbstractWallet);
  });

  it("Create a seaaps wallet and verify that the generated content is correct.", () => {
    const seaaps = new Wallet("seaaps");
    const wallet = seaaps.createWallet();
    expect(seaaps.isValidSecret(wallet.secret || "")).toEqual(true);
    expect(seaaps.isValidAddress(wallet.address || "")).toEqual(true);
  });

  it("Perform hash digest processing on a data.", () => {
    const seaaps = new Wallet("seaaps");
    const content = "1234567890";
    const contentHashDigest = "c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646";
    expect(seaaps.generateHash256(content)).toEqual(contentHashDigest);
  });

  it("Get fee.", () => {
    const seaaps = new Wallet("seaaps");
    expect(seaaps.getFee()).toEqual(10000);
  });

  it("Get currency.", () => {
    const seaaps = new Wallet("seaaps");
    expect(seaaps.getCurrency()).toEqual("SEAA");
  });

  it("Get issuer.", () => {
    const seaaps = new Wallet("seaaps");
    expect(seaaps.getIssuer()).toEqual("dHb9CJAWyB4dr91VRWn96DkukG4bwjtyTh");
  });

  it("Get the address of the corresponding secret.", () => {
    const seaaps = new Wallet("seaaps");
    const wallet = {
      secret: "snUnCn4ZeY7k2EQhvGiihaDmjwrrF",
      address: "dTUXStyLbXPSPmX851B8U6AKrcqomr9dg"
    };
    expect(seaaps.getAddress(wallet.secret)).toEqual(wallet.address);
  });

  it("Sign the serialized tx data.", () => {
    const seaaps = new Wallet("seaaps");
    const toAccount = {
      secret: "snUnCn4ZeY7k2EQhvGiihaDmjwrrF",
      address: "dTUXStyLbXPSPmX851B8U6AKrcqomr9dg"
    };
    const fromAccount = {
      secret: "shDoHSYiJUjKomrF4sYFUB1Cbj7jH",
      address: "dGhrFmn7ehQXLQyEghhQTyAFqY8R3uKdsV"
    };
    const paymentTx = serializePayment(
      fromAccount.address || "",
      "1",
      toAccount.address || "",
      seaaps.getCurrency(),
      "",
      seaaps.getFee(),
      seaaps.getCurrency(),
      seaaps.getIssuer()
    );
    const signResult = seaaps.sign(paymentTx, fromAccount.secret || "");
    expect(Object.keys(signResult)).toContain("hash");
    expect(Object.keys(signResult)).toContain("blob");
  });

  it("Multi sign the serialized tx data.", () => {
    const seaaps = new Wallet("seaaps");
    const toAccount = {
      secret: "snUnCn4ZeY7k2EQhvGiihaDmjwrrF",
      address: "dTUXStyLbXPSPmX851B8U6AKrcqomr9dg"
    };
    const fromAccount = {
      secret: "shDoHSYiJUjKomrF4sYFUB1Cbj7jH",
      address: "dGhrFmn7ehQXLQyEghhQTyAFqY8R3uKdsV"
    };
    const paymentTx = serializePayment(
      fromAccount.address || "",
      "1",
      toAccount.address || "",
      seaaps.getCurrency(),
      [
        {
          Memo: {
            MemoData: "123",
            MemoType: "hex"
          }
        }
      ],
      seaaps.getFee(),
      seaaps.getCurrency(),
      seaaps.getIssuer()
    );
    const expectResult = {
      Account: "dGhrFmn7ehQXLQyEghhQTyAFqY8R3uKdsV",
      Amount: "1000000",
      Destination: "dTUXStyLbXPSPmX851B8U6AKrcqomr9dg",
      Fee: "80000",
      Flags: 0,
      Memos: [{ Memo: { MemoData: "1230", MemoType: "686578" } }],
      TransactionType: "Payment",
      SigningPubKey: "",
      Signers: [
        {
          Signer: {
            Account: "dGhrFmn7ehQXLQyEghhQTyAFqY8R3uKdsV",
            SigningPubKey: "029ED067E1F223DA71979AAF91F0238D04BBCEFF88AC1CFEA09FFEF2C572707F4C",
            TxnSignature:
              "3044022033A6FC1599AEF626573EC395600D5229BB0F53830193D27BDD772F443C76CF140220729088BB6EAFCDCF5746FCAEAC3724C8D21F7E7B2A9C9BF6EC48D4ECEF2EEFBE"
          }
        }
      ]
    };
    const multiSignResult = seaaps.multiSign(paymentTx, fromAccount.secret);
    expect(multiSignResult).toEqual(expectResult);
  });
});
