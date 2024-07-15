import * as tx from "./src/tx";
import { Wallet } from "./src";

const jingtum = new Wallet("jingtum");
// const toAccount = {
//   secret: "sshGrW6mFqRD2xyk7GwBF4avaFeWB",
//   address: "jpfTTYjTpkA5s4rY5xXRb9ZzRqvHs931DK"
// };
const fromAccount = {
  secret: "ssVayvayrW6bRR1aZZWnHVfZmutco",
  address: "jsxszyS1eCzF7upPUaLgpuPuGdq15EAfjM"
};
const serializeTX = tx.serializeSetAccount(fromAccount.address, false, jingtum.getFee());
console.log(serializeTX);
