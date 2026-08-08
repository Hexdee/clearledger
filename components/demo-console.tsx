"use client";

import { useState } from "react";
import { BrowserProvider, isAddress } from "ethers";

type WindowWithEthereum = Window & { ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown> } };
type Decision = "idle" | "checking" | "approved" | "blocked";

const previewSteps = [
  ["Invoice issued", "Supplier commits invoice terms and policy hash."],
  ["Buyer confirmed", "Buyer confirms the commercial obligation."],
  ["Financing cleared", "CVI and CCP approve the funder before value moves."],
  ["Settled in CVA", "A-Token repayment completes the audit trail."],
] as const;

export function DemoConsole({ chain, tokenAddress, contractAddress }: { chain: string; tokenAddress?: string; contractAddress?: string }) {
  const [wallet, setWallet] = useState("");
  const [message, setMessage] = useState("Connect a wallet or paste an address to run a real Cleanverse sandbox preflight.");
  const [decision, setDecision] = useState<Decision>("idle");
  const [previewStep, setPreviewStep] = useState(0);

  async function connectWallet() {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (!ethereum) {
      setMessage("No browser wallet was found. You can paste a wallet address instead.");
      return;
    }
    try {
      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = String(accounts[0] ?? "");
      setWallet(address);
      setMessage(address ? "Wallet connected. Run the compliance preflight when ready." : "The wallet returned no address.");
    } catch {
      setMessage("Wallet connection was cancelled.");
    }
  }

  async function runPreflight() {
    if (!isAddress(wallet)) {
      setDecision("blocked");
      setMessage("Enter a valid EVM wallet address first.");
      return;
    }
    setDecision("checking");
    setMessage("Checking identity status, transfer eligibility, and the financing-pool policy…");
    try {
      const apassResponse = await fetch("/api/cleanverse/apass/query", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ address: wallet, chain }),
      });
      const apass = await apassResponse.json();
      if (!apassResponse.ok) throw new Error(apass.error ?? "The identity check could not be completed.");

      let transferAllowed = true;
      if (tokenAddress) {
        const response = await fetch("/api/cleanverse/apass/verify", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ address: wallet, chain, atoken: tokenAddress }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "The transfer check could not be completed.");
        transferAllowed = result.data?.code === 4;
      }

      let poolAllowed = true;
      if (contractAddress) {
        const response = await fetch("/api/cleanverse/validator/verify", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ userAddress: wallet, contractAddress, chain }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "The pool check could not be completed.");
        poolAllowed = result.data?.valid === true;
      }

      const active = apass.data?.status === 1;
      const approved = active && transferAllowed && poolAllowed;
      setDecision(approved ? "approved" : "blocked");
      setMessage(approved
        ? `Approved. A-Pass is active at tier ${apass.data?.tier ?? "—"}; CVA and pool policy checks passed.`
        : `Blocked before financing. Identity: ${active ? "active" : "inactive"}; CVA: ${transferAllowed ? "pass" : "fail"}; pool: ${poolAllowed ? "pass" : "fail"}.`);
    } catch (error) {
      setDecision("blocked");
      setMessage(error instanceof Error ? error.message : "The sandbox preflight could not be completed.");
    }
  }

  return (
    <section className="console-section" id="demo">
      <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">INTERACTIVE DEMO</p>
          <h2>See trust decided before money moves.</h2>
        </div>
        <div className="console-grid">
          <article className="console-card preflight-card">
            <div className="card-kicker">Live Cleanverse sandbox</div>
            <h3>Participant preflight</h3>
            <p>Check whether a wallet can finance the invoice under its identity, asset, and pool rules.</p>
            <label className="address-field">
              <span>Wallet address</span>
              <input value={wallet} onChange={(event) => setWallet(event.target.value.trim())} placeholder="0x…" inputMode="text" />
            </label>
            <div className="action-row">
              <button className="button secondary" onClick={connectWallet}>Connect wallet</button>
              <button className="button" onClick={runPreflight} disabled={decision === "checking"}>{decision === "checking" ? "Checking…" : "Run preflight"}</button>
            </div>
            <div className={`status ${decision}`} role="status"><span className="decision-dot" />{message}</div>
            <div className="integration-status">
              <span><i className={tokenAddress ? "ready" : "pending"} />CVA {tokenAddress ? "configured" : "awaiting issuance"}</span>
              <span><i className={contractAddress ? "ready" : "pending"} />CCP {contractAddress ? "registered pool" : "awaiting deployment"}</span>
            </div>
          </article>

          <article className="console-card lifecycle-card">
            <div className="card-kicker">Guided lifecycle preview</div>
            <div className="card-title-row"><div><h3>INV-CL-001</h3><p>Buyer-confirmed services invoice</p></div><strong>10,000 <small>clUSD</small></strong></div>
            <div className="progress-track"><span style={{ width: `${((previewStep + 1) / previewSteps.length) * 100}%` }} /></div>
            <div className="audit-list">
              {previewSteps.map(([title, copy], index) => (
                <button key={title} className={index <= previewStep ? "complete" : ""} onClick={() => setPreviewStep(index)}>
                  <span>{index < previewStep ? "✓" : index + 1}</span><div><strong>{title}</strong><small>{copy}</small></div>
                </button>
              ))}
            </div>
            <div className="invoice-facts"><span><small>Advance</small>8,000 clUSD</span><span><small>Repayment</small>8,300 clUSD</span><span><small>Term</small>30 days</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}
