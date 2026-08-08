# ClearLedger Build and Submission Plan

## Hackathon timeline

- Registration closes: **August 7, 2026 at 23:59 UTC**
- Build and final submission window: **August 8, 00:00 through August 9, 23:59 UTC**
- Judging: **August 10–14, 2026 UTC**
- Results: **August 14, 2026 UTC**

## Product scope

ClearLedger demonstrates one complete financing lifecycle:

1. Supplier eligibility is checked through CVI.
2. Buyer eligibility is checked and the invoice obligation is confirmed.
3. An invoice-backed position is issued with amount, maturity, policy, and status references.
4. A CVI-gated liquidity provider funds the invoice with CVA.
5. A deliberately ineligible transfer is rejected to prove rule enforcement.
6. The buyer repays in CVA; principal and yield are distributed.
7. The UI displays the auditable lifecycle without exposing participant PII.

## Architecture

### Web application

- Wallet connection and role selection: supplier, buyer, liquidity provider
- Invoice creation and confirmation flow
- Eligibility and policy status indicators
- Funding, attempted transfer, and repayment actions
- Human-readable audit trail and demo seed data

### Smart contracts

- `InvoiceRegistry`: invoice lifecycle and buyer confirmation
- `InvoicePosition`: RWA ownership or participation representation
- `FundingPool`: CVA funding, repayment, and distribution
- `PolicyGuard`: adapter that enforces CVI and Cleanverse policy checks

Contract interfaces remain provisional until the post-registration Cleanverse documentation and sandbox credentials arrive.

### Cleanverse integration

- CVI: participant entry condition and transfer eligibility
- CVA: funding and repayment asset
- Pre-transaction rules: transfer restrictions and compliant settlement
- Reporting: audit-ready lifecycle evidence for the demo

## 48-hour build sequence

### Hours 0–4: access and vertical slice

- Verify sandbox credentials and API authentication
- Map actual CVI, CVA, and rule-check endpoints
- Implement a single mocked invoice flow end to end

### Hours 4–16: contracts and integration

- Implement invoice lifecycle and funding contracts
- Add policy adapter and explicit rejection path
- Add local tests for issuance, funding, transfer denial, and repayment

### Hours 16–28: product experience

- Build the four-role demo screens
- Connect wallet, contracts, and Cleanverse sandbox
- Add deterministic demo accounts and seed data

### Hours 28–38: hardening

- Test failure states and privacy boundaries
- Deploy contracts and web app to one supported chain
- Capture transaction links and integration evidence

### Hours 38–48: submission

- Record a 2–3 minute demo video
- Finish README, architecture notes, and setup instructions
- Make the repository public and verify a clean install
- Submit repository, video, and working deployment before the deadline

## Judging alignment

- **Concept & problem definition (20):** clear working-capital problem and user roles
- **CVI/CVA integration (30):** both primitives drive issuance, access, transfer, and settlement
- **Build quality (25):** one complete vertical slice with tests and a working deployment
- **UX & demo (15):** guided lifecycle plus a visible rejected-transfer proof
- **Scalability (10):** policy adapters, jurisdiction profiles, gateway settlement, and secondary markets

## Final submission checklist

- Public repository with license and setup steps
- Deployed web app
- Deployed contract addresses and supported chain
- Cleanverse sandbox integration documented
- Automated tests passing
- Demo wallets and scenario instructions
- 2–3 minute demo video
- Architecture diagram or short technical overview
- Privacy statement explaining what is and is not public on-chain
- Pitch deck
- Submission form completed before August 9 at 23:59 UTC
