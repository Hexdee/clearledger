# ClearLedger — compliance-native invoice finance

**One-line pitch:** Buyer-confirmed invoices become programmable assets that verified liquidity can fund and settle on-chain.

## Problem

Small suppliers routinely wait 30–90 days for payment, even after delivering work to creditworthy buyers. Conventional invoice financing is slow and opaque, while a basic on-chain invoice token introduces new risks: anonymous counterparties, unrestricted transfers, and no reliable connection between the commercial obligation and settlement.

## Solution

ClearLedger creates a governed financing lifecycle around a buyer-confirmed invoice. A verified supplier commits the invoice terms and evidence hash; a verified buyer confirms the obligation; an eligible funder advances capital; and the buyer repays through the same policy-controlled settlement asset. The contract prevents financing before confirmation and records issuance, funding, repayment, and claim events for an audit-ready history.

## CVI · CVA integration points

1. **Identity from issuance — CVI / A-Pass:** supplier, buyer, and funder receive wallet-bound credentials before participating. ClearLedger evaluates active status, expiration, tier, group, subgroup, and country eligibility. No personal identity data is written to the invoice contract.
2. **Governed value — CVA / A-Token:** a Cleanverse-issued A-Token is selected when the invoice is created and is the only asset accepted for the advance and repayment. Its embedded transfer policy makes CVI eligibility part of every movement of value.
3. **Pool policy — CCP Protocol:** the deployed invoice contract is registered as a compliant pool. Before financing, one preflight combines the A-Pass record, A-Token decision, and CCP validator result. Failed checks return human-readable reasons and block the transaction before money moves.

CVI and CVA are therefore dependencies of the core flow, not optional onboarding features: identity determines who may participate, while the verified asset finances and settles the invoice.

## Build quality and demo

The prototype includes a tested Solidity lifecycle contract, server-only encrypted Cleanverse integration, reproducible issuance/deployment commands, and a responsive web demo. The recording shows both paths: an eligible wallet financing and settling an invoice, and an ineligible wallet being rejected before execution. Secrets and personal data remain outside the browser and public contract state.

## Deployed chain and scalability

**Chain:** Monad testnet/sandbox. Final A-Token, contract, transaction, video, and live-demo links will be added after deployment.

**Repository:** https://github.com/Hexdee/clearledger

The architecture generalizes from one invoice to portfolios, jurisdiction-specific policies, risk tiers, multiple funders, secondary transfers, and institutional fiat gateways without changing the identity and settlement trust layer.
