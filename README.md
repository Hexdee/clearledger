# ClearLedger

ClearLedger is a compliance-native invoice-finance prototype for the **Cleanverse Build: Trusted Assets Hackathon** RWA track.

**Live demo:** https://clearledger-roan.vercel.app

It turns a verified business invoice into a programmable financing asset. Cleanverse Verified Identity (CVI) gates suppliers, buyers, and liquidity providers; Cleanverse Verified Assets (CVA) provides the settlement asset; and transaction rules enforce eligibility and transfer restrictions before value moves.

## What is implemented

- Interactive Next.js demo with wallet connection and live Cleanverse preflight
- Server-only Cleanverse client with the required encrypted-request format
- CVI A-Pass generation, query, and A-Token transfer verification
- CVA A-Token launch, application status, listing, and faucet support
- CCP pool registration, owner signature, and participant verification
- `ClearLedgerInvoice` lifecycle contract with issuance, buyer confirmation, financing, repayment, claim, and cancellation
- Unit tests for Cleanverse encryption and the complete on-chain invoice lifecycle

## Run locally

Requirements: Node.js 20+, pnpm, and Foundry.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Cleanverse credentials remain server-side and must never use a `NEXT_PUBLIC_` prefix.

Run every quality check:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
forge test -vvv
```

## Cleanverse operator workflow

Copy the non-secret templates in `config/`, replace the placeholders, and keep real payloads untracked if they contain identity data.

```bash
pnpm cleanverse generate-apass path/to/apass.json
pnpm cleanverse launch-atoken path/to/atoken.json
pnpm cleanverse atoken-status REQUEST_ID
pnpm cleanverse faucet TOKEN_SYMBOL WALLET AMOUNT
pnpm contracts:deploy
pnpm cleanverse register-pool path/to/pool.json
pnpm cleanverse verify-pool CONTRACT_ADDRESS USER_ADDRESS
```

After issuance and deployment, fill both server-only and matching public address fields in `.env.local`, then rebuild the demo.

## Project package

- `application/application-pack.md` — copy for the registration form
- `application/build-and-submission-plan.md` — 48-hour implementation plan and final-submission checklist
- `assets/clearledger-icon-512.png` — application-ready 512×512 project icon
- `assets/clearledger-hero.png` — pitch-deck visual
- `deliverables/clearledger-pitch.pptx` — application pitch deck
- `application/submission-receipt.md` — submitted application number and status

## Demo story

1. A verified supplier creates an invoice record.
2. A verified buyer confirms the obligation.
3. The invoice is represented as a transferable RWA position.
4. Eligible liquidity providers fund it through a gated pool.
5. Every transfer checks CVI-derived eligibility and policy rules.
6. Repayment settles in CVA and produces an audit-ready event trail.

The final submission checklist, one-page summary, and recording script are in `submission/`.
