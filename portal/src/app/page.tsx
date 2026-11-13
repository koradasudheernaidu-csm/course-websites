const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'Academic Credential Office';

export default function HomePage() {
  return <>
    <header className="site-header">
      <nav className="site-nav">
        <a className="site-brand" href="/">
          <span className="site-brand-mark">LC</span>
          <span className="site-brand-copy"><strong>{issuerName}</strong><small>Academic credential register</small></span>
        </a>
        <div className="site-nav-links">
          <a href="/verify">Verify a record</a>
          <a className="nav-action" href="/create">Issuer workspace&nbsp; ↗</a>
        </div>
      </nav>
    </header>

    <main className="site-shell home-wrap">
      <section className="home-hero">
        <div className="home-copy">
          <div className="overline">Digital learning · Verified achievement</div>
          <h1 className="home-title">Learning deserves a <em>lasting record.</em></h1>
          <p className="home-intro">
            Issue structured academic achievement records, provide a downloadable certificate,
            and let recipients share a verification link that checks the live issuer register.
          </p>
          <div className="home-actions">
            <a className="home-primary" href="/create">Open issuer workspace <span>↗</span></a>
            <a className="home-secondary" href="/verify">Verify a certificate <span>⌕</span></a>
          </div>
          <div className="home-hero-meta"><span><i /> Unique certificate reference</span><span><i /> QR-linked lookup</span><span><i /> Shared record register</span></div>
        </div>

        <div className="home-specimen-wrap" aria-label="Illustrative certificate design">
          <div className="home-specimen">
            <div className="home-specimen-head">
              <span className="home-specimen-logo"><i>LC</i>{issuerName.toUpperCase().slice(0, 34)}</span>
              <span className="home-specimen-ref">SAMPLE / 2026</span>
            </div>
            <div className="home-specimen-label">DEMONSTRATION DOCUMENT</div>
            <h2>Academic Online<br />Certification</h2>
            <p>This certificate is presented to</p>
            <p className="sample-name">Learner Name</p>
            <p>for successfully completing</p>
            <div className="home-specimen-course">Introduction to Machine Learning</div>
            <div className="home-specimen-scores">
              <div><span>ASSIGNMENTS</span><strong>22.5 / 25</strong></div>
              <div><span>EXAMINATION</span><strong>48 / 75</strong></div>
              <div><span>TOTAL SCORE</span><strong>70.5%</strong></div>
            </div>
            <div className="home-specimen-footer"><div className="home-specimen-sign">Academic signatory</div><div className="home-specimen-sign">Course coordinator</div><div className="home-specimen-qr" /></div>
          </div>
          <div className="home-specimen-disclaimer">ILLUSTRATIVE DESIGN · NOT AN OFFICIAL NPTEL CERTIFICATE</div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="workflow-intro">
          <span className="section-kicker">A SIMPLE THREE-STEP FLOW</span>
          <h2>From achievement to proof.</h2>
          <p>One record powers the PDF, QR code and public verification page.</p>
        </div>
        <div className="workflow-list">
          <article className="workflow-step"><b>01</b><h3>Issue the record</h3><p>Enter learner, course and assessment details in the protected issuer workspace.</p></article>
          <article className="workflow-step"><b>02</b><h3>Generate & share</h3><p>Create a print-ready PDF with its own reference number and verification QR.</p></article>
          <article className="workflow-step"><b>03</b><h3>Verify the details</h3><p>Scan the QR or enter the reference to check the issuer's current database record.</p></article>
        </div>
      </section>

      <div className="demo-notice"><b>DEMONSTRATION PORTAL</b><span>This independent academic-certificate demo uses an NPTEL-inspired information layout. It is not operated by NPTEL and does not issue official NPTEL, IIT or SWAYAM credentials. Website verification checks the issuer database record; it is not a cryptographic Verifiable Credential signature check.</span></div>
    </main>

    <footer className="site-footer"><strong>{issuerName}</strong> · Independent digital credential demonstration</footer>
  </>;
}
