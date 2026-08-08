# ClearLedger — verified invoice finance

## Problem

Small suppliers routinely wait 30–90 days for payment while conventional invoice financing is slow, opaque, and expensive. Moving invoices on-chain does not solve the hardest part: financiers still need trustworthy counterparties, policy-compliant settlement, and a lifecycle they can audit.

## Solution

ClearLedger turns a buyer-confirmed invoice into a programmable real-world financing position. A supplier records the invoice terms and evidence commitment; the buyer confirms the obligation; an eligible liquidity provider advances funds; and the buyer repays through the same governed settlement layer. The Solidity contract records every lifecycle transition and prevents financing before buyer confirmation.

## Cleanverse integration

- **CVI / A-Pass:** supplier, buyer, and funder wallets receive wallet-bound identity credentials. The app queries active status, tier, group, subgroup, and country eligibility before financing.
- **CVA / A-Token:** a Cleanverse-issued A-Token is the contract's settlement asset for both the advance and repayment. Its embedded rules make identity policy part of every value transfer rather than a separate onboarding checkbox.
- **CCP Protocol:** the deployed invoice contract is registered as a compliant pool. The demo calls the validator before financing so an ineligible participant is visibly blocked before submitting an on-chain transaction.

CVI and CVA are both core to the flow: without a valid identity the participant cannot pass the policy, and without the verified settlement asset the invoice cannot be financed or repaid.

## Deployed chain

Monad sandbox/testnet. Final contract, A-Token, transaction, live-demo, and repository links are added after deployment.

## Evidence

The public repository contains build-window commit history, tested smart contracts, encrypted Cleanverse integration, an interactive compliance preflight, architecture notes, and reproducible operator commands.
