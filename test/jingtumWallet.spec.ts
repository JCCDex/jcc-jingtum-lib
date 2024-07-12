import { AbstractWallet, serializePayment, Wallet } from "../src";

describe("jingtum", () => {
  it("constructor", () => {
    const jingtum = new Wallet("jingtum");
    expect(jingtum).toBeInstanceOf(AbstractWallet);
    const gmJingtum = new Wallet({ guomi: true });
    expect(gmJingtum).toBeInstanceOf(AbstractWallet);
  });

  it("Create a jingtum wallet and verify that the generated content is correct.", () => {
    const jingtum = new Wallet("jingtum");
    const wallet = jingtum.createWallet();
    expect(jingtum.isValidSecret(wallet.secret || "")).toEqual(true);
    expect(jingtum.isValidAddress(wallet.address || "")).toEqual(true);
  });

  it("Perform hash digest processing on a data.", () => {
    const jingtum = new Wallet("jingtum");
    const content = "1234567890";
    const contentHashDigest = "c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646";
    expect(jingtum.generateHash256(content)).toEqual(contentHashDigest);
    const gmJingtum = new Wallet({ guomi: true });
    const gmContentHashDigest = "2494b501874781a11750cfbfb40abeb353915629dbac984012db800feb83d315";
    expect(gmJingtum.generateHash256(content)).toEqual(gmContentHashDigest);
  });

  it("Get fee.", () => {
    const jingtum = new Wallet("jingtum");
    expect(jingtum.getFee()).toEqual(10000);
  });

  it("Get currency.", () => {
    const jingtum = new Wallet("jingtum");
    expect(jingtum.getCurrency()).toEqual("SWT");
  });

  it("Get issuer.", () => {
    const jingtum = new Wallet("jingtum");
    expect(jingtum.getIssuer()).toEqual("jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or");
  });

  it("Get the address of the corresponding secret.", () => {
    const jingtum = new Wallet("jingtum");
    const wallet = {
      secret: "sshGrW6mFqRD2xyk7GwBF4avaFeWB",
      address: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK"
    };
    expect(jingtum.getAddress(wallet.secret)).toEqual(wallet.address);
  });

  it("Sign the serialized tx data.", () => {
    const jingtum = new Wallet("jingtum");
    const toAccount = {
      secret: "sshGrW6mFqRD2xyk7GwBF4avaFeWB",
      address: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK"
    };
    const fromAccount = {
      secret: "sEdVmyqoq2ZhZEQdUtBGCexBAhE7Dof",
      address: "jp4nUEDsePuy4YGhwZT3g7X89kT1rFjPaF"
    };
    const paymentTx = serializePayment(
      fromAccount.address,
      "1",
      toAccount.address,
      jingtum.getCurrency(),
      "",
      jingtum.getFee(),
      jingtum.getCurrency(),
      jingtum.getIssuer()
    );
    const signResult = jingtum.sign(paymentTx, fromAccount.secret);
    expect(Object.keys(signResult)).toContain("hash");
    expect(Object.keys(signResult)).toContain("blob");
  });

  it("Multi sign the serialized tx data.", () => {
    const jingtum = new Wallet("jingtum");
    const toAccount = {
      secret: "sshGrW6mFqRD2xyk7GwBF4avaFeWB",
      address: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK"
    };
    const fromAccount = {
      secret: "sEdVmyqoq2ZhZEQdUtBGCexBAhE7Dof",
      address: "jp4nUEDsePuy4YGhwZT3g7X89kT1rFjPaF"
    };
    const paymentTx = serializePayment(
      fromAccount.address || "",
      "1",
      toAccount.address || "",
      jingtum.getCurrency(),
      [
        {
          Memo: {
            MemoData: "{massage: 'test'}",
            MemoType: "Object"
          }
        }
      ],
      jingtum.getFee(),
      jingtum.getCurrency(),
      jingtum.getIssuer()
    );
    const expectResult = {
      Account: "jp4nUEDsePuy4YGhwZT3g7X89kT1rFjPaF",
      Amount: "1000000",
      Destination: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK",
      Fee: "80000",
      Flags: 0,
      Memos: [undefined],
      TransactionType: "Payment",
      SigningPubKey: "",
      Signers: [
        {
          Signer: {
            Account: "jp4nUEDsePuy4YGhwZT3g7X89kT1rFjPaF",
            SigningPubKey: "ED6E1FA92CBCB37368E7621D1563E4F2FB767000EAA2A87C06D7E35342358B7032",
            TxnSignature:
              "31F70160BFCD753AD84717B0723049E83E7E3D2825A84A8D11CCFA9F2C687CE71B977C9A4578961C9271C84B1BA94257CC66776A6FB58E50612E9447C23A8207"
          }
        }
      ]
    };
    const multiSignResult = jingtum.multiSign(paymentTx, fromAccount.secret || "");
    expect(multiSignResult).toEqual(expectResult);
  });
});
