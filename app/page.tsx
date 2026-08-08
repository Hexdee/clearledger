import Image from "next/image";
import { DemoConsole } from "@/components/demo-console";

const lifecycle = [
  { number: "01", title: "Issue", copy: "A verified supplier records an invoice and its policy commitment." },
  { number: "02", title: "Confirm", copy: "The verified buyer confirms the commercial obligation." },
  { number: "03", title: "Finance", copy: "An eligible provider advances CVA through the gated pool." },
  { number: "04", title: "Settle", copy: "The buyer repays in CVA and the lifecycle becomes audit-ready." },
];

export default function Home() {
  const chain = process.env.NEXT_PUBLIC_CLEANVERSE_CHAIN ?? "monad";
  const tokenAddress = process.env.NEXT_PUBLIC_CLEANVERSE_ATOKEN_ADDRESS;
  const contractAddress = process.env.NEXT_PUBLIC_CLEAREDGER_CONTRACT_ADDRESS;
  return (
    <main>
      <nav className="nav shell">
        <div className="brand">
          <Image src="/clearledger-icon.png" alt="ClearLedger" width={42} height={42} priority />
          <span>ClearLedger</span>
        </div>
        <div className="nav-links"><a href="#how-it-works">How it works</a><a href="#demo">Open demo</a><span>RWA track</span></div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">VERIFIED INVOICE FINANCE</p>
          <h1>Working capital with trust built into every transfer.</h1>
          <p className="hero-lede">
            ClearLedger turns buyer-confirmed invoices into programmable RWAs. CVI verifies every participant,
            CVA settles the financing lifecycle, and CCP rules reject ineligible transfers before value moves.
          </p>
          <div className="hero-proof">
            <span>✓ CVI-gated access</span>
            <span>✓ CVA settlement</span>
            <span>✓ Auditable lifecycle</span>
          </div>
          <a className="hero-cta" href="#demo">Try the compliance preflight <span>→</span></a>
        </div>
        <div className="hero-visual">
          <Image src="/clearledger-hero.png" alt="A verified invoice entering compliant on-chain liquidity" fill priority sizes="(max-width: 900px) 100vw, 45vw" />
        </div>
      </section>

      <section className="section shell" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">ONE COMPLETE LIFECYCLE</p>
          <h2>The asset stays governed from issuance to repayment.</h2>
        </div>
        <div className="lifecycle">
          {lifecycle.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section integration-band">
        <div className="shell integration-grid">
          <div className="section-heading light">
            <p className="eyebrow">CLEANVERSE AT THE CORE</p>
            <h2>Compliance is infrastructure, not a checkbox.</h2>
          </div>
          <div className="primitive-list">
            <article><strong>CVI · A-Pass</strong><p>Wallet-bound identity, eligibility, tier, status, and country policy.</p></article>
            <article><strong>CVA · A-Token</strong><p>The verified funding and repayment asset with embedded transfer rules.</p></article>
            <article><strong>CCP · Validator</strong><p>Pool-level preflight checks that make failed transfers visible before execution.</p></article>
          </div>
        </div>
      </section>

      <DemoConsole chain={chain} tokenAddress={tokenAddress} contractAddress={contractAddress} />

      <footer className="footer shell">
        <div className="brand"><Image src="/clearledger-icon.png" alt="" width={32} height={32} /><span>ClearLedger</span></div>
        <p>Built for Cleanverse Build: Trusted Assets Hackathon.</p>
      </footer>
    </main>
  );
}
