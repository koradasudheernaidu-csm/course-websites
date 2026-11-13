import CertificateForm from '@/components/CertificateForm';

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'CourseBridge Learning Demo';

export default function CreatePage() {
  return <>
    <header className="cb-header cb-header-compact"><nav className="cb-nav"><a className="cb-brand" href="/"><span className="cb-brand-mark">c<span>.</span></span><strong>coursebridge</strong><small>LEARNING DEMO</small></a><div className="cb-nav-spacer" /><a className="cb-nav-link" href="/">Explore</a><a className="cb-nav-link" href="/verify">Verify certificate</a><a className="cb-login active" href="/create">Issuer workspace</a></nav></header>
    <main className="cb-workspace-shell">
      <div className="cb-breadcrumb"><a href="/">Home</a><span>›</span><span>Issuer workspace</span><span className="cb-workspace-tag">PRIVATE DEMO WORKSPACE</span></div>
      <div className="cb-workspace-heading"><div><span className="cb-kicker">CERTIFICATE ISSUANCE / PARTNER PORTAL</span><h1>Create a course<br /><em>completion certificate.</em></h1><p>Enter the learner and course details. Your document preview updates as you work.</p></div><div className="workspace-step"><span>STEP</span><b>01</b><small>OF 03</small></div></div>
      <div className="cb-workspace-info"><span>✓</span><p>Certificate records are saved to the shared MongoDB registry. Public verification displays the record status held by this demonstration system.</p></div>
      <CertificateForm />
      <div className="cb-page-disclaimer">DEMONSTRATION ONLY · This is not a Coursera issuer account and cannot create official Coursera certificates.</div>
    </main>
    <footer className="cb-footer cb-footer-simple"><a className="cb-brand footer-brand" href="/"><span className="cb-brand-mark">c<span>.</span></span><strong>coursebridge</strong></a><span>{issuerName} · Issuer workspace</span><div><a href="/verify">Certificate verification</a></div></footer>
  </>;
}
