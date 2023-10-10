# jcc-jingtum-lib

## Installtion

```shell
npm install @jccdex/jingtum-lib
```

## Example

```javascript
import { Transaction } from "@jccdex/jingtum-lib";

// create new tx object by chainid, nodes, retry times
let tx = new Transaction("jingtum", ["https://xxx.xxx.xxx.xxx"], 0);

// set token issuer
const hash1 = await tx.setTokenIssue(
  issuerAdminAddress,
  issuerAdminSecret,
  publisherAddress,
  amount,
  nftTokenName,
  transferSetFlag /**  default set 0, other means owner can not transfer to other */
);

// publisher mint 721 token
const hash2 = await tx.publish721(publisherAddress, publisherSecret, reciverAddress, tokenName, tokenId, tokenInfos);
// tokenInfos is json array like [{type: "uri", data: "https://xxx"}, {type: "color", data: "red"}]

// transfer 721
const hash3 = await tx.transfer721(senderAddress, senderSecret, reciverAddress, tokenId);

// delete 721
const hash4 = await tx.delete721(publisherAddress, publisherSecret, tokenId);

// request token info
const info = await tx.requestTokenInfo("https://xxx.xxx", tokenId);

// request token in account
const result = await tx.requestAccountToken("https://xxx.xxx", address);
```
