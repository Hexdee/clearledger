# ClearLedger Architecture

## Trust boundary

The Cleanverse `api-key` is never sent to the browser. Next.js route handlers and the operator CLI are the only components that call the Cleanverse sandbox. Encrypted endpoints use AES-CBC with PKCS#5/PKCS#7 padding, a 16-byte zero IV, and the Base64-decoded key supplied by Cleanverse.

## Core flow

1. **CVI issuance:** the operator creates sandbox A-Passes for the supplier, buyer, and liquidity-provider wallets.
2. **Invoice issuance:** the supplier creates an invoice commitment in `ClearLedgerInvoice`; the buyer confirms it.
3. **Compliance preflight:** the app calls `query_apass`, `verify_apass`, and—after pool registration—`validator/verify`.
4. **CVA financing:** the funder approves the issued A-Token and finances the invoice. The A-Token's embedded Cleanverse rules enforce transfer eligibility on-chain.
5. **Repayment:** the buyer repays in CVA and the funder claims the proceeds.
6. **Evidence:** contract events, A-Pass query results, validator decisions, and Cleanverse transaction data form the demo audit trail.

## Why both CVI and CVA are core

- Without CVI, wallets cannot pass the A-Token or pool policy.
- Without CVA, the invoice cannot be financed or repaid through the governed settlement layer.
- CCP makes the rejection path visible before the transaction and provides a pool-level policy surface.
