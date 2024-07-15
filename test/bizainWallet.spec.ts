import { AbstractWallet, serializePayment, Wallet } from "../src";
import { expect } from "chai";

describe("bizain", () => {
  it("constructor", () => {
    const bizain = new Wallet("bizain");
    expect(bizain).to.be.an.instanceof(AbstractWallet);
  });

  it("Create a bizain wallet and verify that the generated content is correct.", () => {
    const bizain = new Wallet("bizain");
    const wallet = bizain.createWallet();
    expect(bizain.isValidSecret(wallet.secret || "")).to.equal(true);
    expect(bizain.isValidAddress(wallet.address || "")).to.equal(true);
  });

  it("Perform hash digest processing on a data.", () => {
    const bizain = new Wallet("bizain");
    const content = "1234567890";
    const contentHashDigest = "c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646";
    expect(bizain.generateHash256(content)).to.equal(contentHashDigest);
  });

  it("Get fee.", () => {
    const bizain = new Wallet("bizain");
    expect(bizain.getFee()).to.equal(10);
  });

  it("Get currency.", () => {
    const bizain = new Wallet("bizain");
    expect(bizain.getCurrency()).to.equal("BWT");
  });

  it("Get issuer.", () => {
    const bizain = new Wallet("bizain");
    expect(bizain.getIssuer()).to.equal("bf42S78serP2BeSx7HGtwQR2QASYaHVqyb");
  });

  it("Get the address of the corresponding secret.", () => {
    const bizain = new Wallet("bizain");
    const wallet = {
      secret: "sh6uzM8gARyFzeXYRaTYsUsFARp1V",
      address: "bE96jztNp2T96vMYhyQdCowSLsw8UpVmxZ"
    };
    expect(bizain.getAddress(wallet.secret)).to.equal(wallet.address);
  });

  it("Sign the serialized tx data.", () => {
    const bizain = new Wallet("bizain");
    const toAccount = {
      secret: "sh6uzM8gARyFzeXYRaTYsUsFARp1V",
      address: "bE96jztNp2T96vMYhyQdCowSLsw8UpVmxZ"
    };
    const fromAccount = {
      secret: "ss6k3VFBpw9doxGLtZGa46RKW8vpM",
      address: "bwcTEb22yvyHzd1Dt78FwxrDBsB4fgqPmK"
    };
    const paymentTx = serializePayment(
      fromAccount.address || "",
      "1",
      toAccount.address || "",
      bizain.getCurrency(),
      "",
      bizain.getFee(),
      bizain.getCurrency(),
      bizain.getIssuer()
    );
    const signResult = bizain.sign(paymentTx, fromAccount.secret || "");
    expect(Object.keys(signResult)).to.contain("hash");
    expect(Object.keys(signResult)).to.contain("blob");
  });

  it("Multi sign the serialized tx data.", () => {
    const bizain = new Wallet("bizain");
    const toAccount = {
      secret: "sh6uzM8gARyFzeXYRaTYsUsFARp1V",
      address: "bE96jztNp2T96vMYhyQdCowSLsw8UpVmxZ"
    };
    const fromAccount = {
      secret: "ss6k3VFBpw9doxGLtZGa46RKW8vpM",
      address: "bwcTEb22yvyHzd1Dt78FwxrDBsB4fgqPmK"
    };
    const paymentTx = serializePayment(
      fromAccount.address || "",
      "1",
      toAccount.address || "",
      bizain.getCurrency(),
      "",
      bizain.getFee(),
      bizain.getCurrency(),
      bizain.getIssuer()
    );
    const expectResult = {
      Account: "bwcTEb22yvyHzd1Dt78FwxrDBsB4fgqPmK",
      Amount: "1000000",
      Destination: "bE96jztNp2T96vMYhyQdCowSLsw8UpVmxZ",
      Fee: "80000",
      Flags: 0,
      Memos: [{ Memo: { MemoData: "", MemoType: "737472696E67" } }],
      TransactionType: "Payment",
      SigningPubKey: "",
      Signers: [
        {
          Signer: {
            Account: "bwcTEb22yvyHzd1Dt78FwxrDBsB4fgqPmK",
            SigningPubKey: "02EE013DC32734CBCA06C45001C2A718198857D82CB194C5975D1764222D382B76",
            TxnSignature:
              "30440220276E15E2486DFB33824C9178375E46E3407CC4E0EE940D1BE55F87FBD92811FE02203B91471A7BB2B3D45984BAE275DB25A10EFF0749E88E7399939235108982CC0B"
          }
        }
      ]
    };
    const multiSignResult = bizain.multiSign(paymentTx, fromAccount.secret);
    expect(multiSignResult).to.eql(expectResult);
  });
});
