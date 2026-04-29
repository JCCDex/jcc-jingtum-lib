# jcc-jingtum-lib

## Installation

**Requires Node.js ≥18.0.0**

```shell
npm install @jccdex/jingtum-lib
```

## Security Notes

- **Always use HTTPS** nodes. HTTP nodes will be rejected at the transport layer.
- **Never log or expose secrets.** Secret keys must be kept in secure storage (e.g. environment variables, hardware wallets).
- **Secret keys are not validated remotely.** All signing happens locally; keys never leave the client.

## Usage

### Setup

```typescript
import { Transaction, Wallet } from "@jccdex/jingtum-lib";

// 1. Create a Wallet instance for your chain
const wallet = new Wallet("jingtum"); // or "bizain" | "seaaps" | ChainOption

// 2. Create a Transaction instance with wallet, HTTPS node(s) and retry count
const tx = new Transaction({
  wallet,
  nodes: ["https://your-jingtum-node.example.com"],
  retry: 3 // optional, number of sequence-conflict retries (default: 0)
});
```

### Wallet Operations

```typescript
// Create a new wallet
const newWallet = wallet.createWallet();
// => { address: "j...", secret: "s..." }

// Validate an address or secret
wallet.isValidAddress("jXXX..."); // => boolean
wallet.isValidSecret("sXXX..."); // => boolean

// Derive address from secret
wallet.getAddress("sXXX..."); // => "jXXX..."

// Get chain native currency, issuer and fee (in drops)
wallet.getCurrency(); // => "SWT"
wallet.getIssuer(); // => "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
wallet.getFee(); // => 10000 (drops)

// SHA-256 hash (SM3 for guomi chains)
wallet.generateHash256("some data"); // => "c775..."

// Sign a pre-built transaction object
const { hash, blob } = wallet.sign(txObject, "sXXX...");

// Multi-sign (collect Signer entries for threshold signing)
const multiSignedTx = wallet.multiSign(txObject, "sXXX...");
```

### Payment (token transfer)

```typescript
const hash = await tx.transfer(
  senderAddress,
  senderSecret,
  "10", // amount
  "hello", // memo (string) or IMemo[] array
  receiverAddress,
  "SWT" // token name; omit issuer for native currency
);
```

### Create / Cancel Order

```typescript
// Create a buy order: 1 CNY for 0.4 JJCC
const hash = await tx.createOrder(
  address,
  secret,
  "1", // amount of base token
  "CNY", // base token
  "JJCC", // counter token
  "0.4", // total (amount × price)
  "buy", // "buy" | "sell"
  platformAddress
);

// Cancel an order by its sequence number
await tx.cancelOrder(address, secret, offerSequence);
```

### NFT (ERC-721) Operations

```typescript
// Set issuance permission for a token
await tx.setTokenIssue(
  issuerAdminAddress,
  issuerAdminSecret,
  publisherAddress,
  1000, // max supply
  "MYNFT", // token name
  TokenFlag.CIRCULATION // 0 = transferable, 1 = non-transferable
);

// Mint (publish) an NFT
await tx.publish721(
  publisherAddress,
  publisherSecret,
  receiverAddress,
  "MYNFT",
  "unique-token-id",
  [{ type: "uri", data: "https://example.com/metadata/1" }] // optional infos
);

// Transfer an NFT
await tx.transfer721(senderAddress, senderSecret, receiverAddress, tokenId);

// Delete (burn) an NFT
await tx.delete721(ownerAddress, ownerSecret, tokenId);
```

### Query

```typescript
// Fetch transaction by hash
const txInfo = await tx.fetchTransaction("TXHASH...");

// Fetch account transaction history
const history = await tx.requestAccountTx(address);

// Fetch NFT tokens owned by account
const tokens = await tx.requestAccountToken(address);

// Fetch NFT token details
const info = await tx.requestTokenInfo(tokenId);
```

### Multi-signature

```typescript
// Each co-signer independently multi-signs the same base tx
const signer1Tx = wallet.multiSign(baseTx, signer1Secret);
const signer2Tx = wallet.multiSign(baseTx, signer2Secret);

// Merge Signers arrays and submit
const mergedBlob = { ...baseTx, Signers: [...signer1Tx.Signers, ...signer2Tx.Signers] };
const { blob } = wallet.sign(mergedBlob, adminSecret);
await tx.submitTransaction(blob);
```

### Custom HTTP Client

```typescript
import { AxiosInterceptorsFactory, Transaction, Wallet } from "@jccdex/jingtum-lib";

const customFetch = AxiosInterceptorsFactory({
  timeout: 10000,
  customRequest: (config) => {
    config.headers["X-Api-Key"] = process.env.NODE_API_KEY;
  }
});

const txWithAuth = new Transaction({
  wallet: new Wallet("jingtum"),
  nodes: ["https://your-node.example.com"],
  fetch: customFetch
});
```

## API Reference

### `new Wallet(chain)`

| Parameter | Type                                               | Description                             |
| --------- | -------------------------------------------------- | --------------------------------------- |
| `chain`   | `"jingtum" \| "bizain" \| "seaaps" \| ChainOption` | Chain identifier or custom chain config |

`ChainOption`: `{ guomi: boolean; ACCOUNT_ALPHABET?: string; currency?: string; fee?: number }`

---

### `new Transaction(options)`

| Option   | Type             | Required | Description                                             |
| -------- | ---------------- | -------- | ------------------------------------------------------- |
| `wallet` | `AbstractWallet` | ✓        | Wallet instance for signing                             |
| `nodes`  | `string[]`       | ✓        | Array of HTTPS node URLs                                |
| `retry`  | `number`         | —        | Retry count on sequence conflict (default: `0`)         |
| `fetch`  | `AxiosInstance`  | —        | Custom axios instance (from `AxiosInterceptorsFactory`) |

---

### `AxiosInterceptorsFactory(options?)`

| Option           | Type                    | Description                                    |
| ---------------- | ----------------------- | ---------------------------------------------- |
| `timeout`        | `number`                | Request timeout in ms (default: `30000`)       |
| `customRequest`  | `(config) => void`      | Hook to add headers / auth before each request |
| `customResponse` | `(response) => unknown` | Hook to transform response data                |
