# Deployment evidence

## Live web deployment

- Production URL: https://clearledger-roan.vercel.app
- Platform: Vercel
- Source commit: `a3b3f6a9768c947dcc833d7910e62785272c35c6`
- Deployment status: ready
- Cleanverse health check: successful (`407` sandbox applications visible at verification time)
- Production preflight: supplier/admin approved with A-Pass tier `50`; CCP pool policy passed
- Cleanverse credentials: encrypted Vercel environment variables, never exposed to browser code

## Demo video

- Public release page: https://github.com/Hexdee/clearledger/releases/tag/demo-v1
- Direct video: https://github.com/Hexdee/clearledger/releases/download/demo-v1/clearledger-demo.mp4
- Duration: 57 seconds
- Resolution: 1280×720
- Contents: product overview, live CVI/CCP preflight approval, and the four-stage invoice lifecycle

## CVI — supplier/admin A-Pass

- Chain: Monad
- Wallet: `0x1b829a971FA388367A7cb1105EA2F0168565c684`
- CV record: `1911`
- Tier: `50`
- Subgroup: `IF`
- Status: active
- Expiration: August 9, 2027 at 23:59 UTC
- Transaction: `0xb75a3bbea914629e83354d05b8dc53b5df357ddc8410e8b348de25bcfcee2241`

## CVI — buyer A-Pass

- Chain: Monad
- Wallet: `0x78086a834b6fa4D716a52A0F3Fb451a9DAB4138c`
- CV record: `1919`
- Tier: `50`
- Subgroup: `IF`
- Status: active
- Expiration: August 9, 2027 at 23:59 UTC
- Transaction: `0xb4fb7fb300073dcf567d5f782994366af8e7e9ca2f4a9959fd6b7dde1de0db3d`

## CVI — funder A-Pass

- Chain: Monad
- Wallet: `0xBd835D9d752fff6495f3B8630F1F216F466e7890`
- CV record: `1921`
- Tier: `50`
- Subgroup: `IF`
- Status: active
- Expiration: August 9, 2027 at 23:59 UTC
- Transaction: `0xd7a3c418da5b859e44d23d6ba836230eb2d2961f4b11c1417025c35efca37c49`

## ClearLedger invoice contract — active deployment

- Chain: Monad testnet
- Deployer: `0x1b829a971FA388367A7cb1105EA2F0168565c684`
- Contract: `0xE3dD43D11380A81D5af0BBd7DB3BeDd4340E0B83`
- Transaction: `0x0edb3c4c29a1a5f7bb66d2fe2bd2fa282c56a5537fe87083b4c20b4314f828d7`
- Receipt status: successful
- On-chain owner: `0x1b829a971FA388367A7cb1105EA2F0168565c684`
- Initial `nextInvoiceId`: `1`

The earlier deployment at `0xd086dAB59F3d183b77c14E6FbbacC421adCD1634` is superseded because it did not expose the `owner()` interface required by CCP registration.

## CCP — compliance pool registration

- Registered contract: `0xE3dD43D11380A81D5af0BBd7DB3BeDd4340E0B83`
- Registration transaction: `0x1e371c892be4325339b162c903c2e0fb1811846010e783128ae85a01b7b0042b`
- Receipt status: successful
- Supplier/admin decision: allowed
- Buyer decision: allowed
- Funder decision: allowed
- Uncredentialed burn-address decision: blocked
- Policy: subgroup `IF`, minimum tier `1`, minimum subtier `1`

Additional CVA and lifecycle transactions will be appended when the pending A-Token issuance completes.
