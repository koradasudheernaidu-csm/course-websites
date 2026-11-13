import CertificateForm from '@/components/CertificateForm';

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'Academic Credential Office';

export default function CreatePage() {
  return <>
    <header className="site-header">
      <nav className="site-nav">
        <a className="site-brand" href="/"><span className="site-brand-mark">LC</span><span className="site-brand-copy"><strong>{issuerName}</strong><small>Issuer workspace</small></span></a>
        <div className="site-nav-links"><a href="/">Home</a><a href="/verify">Verify</a></div>
      </nav>
    </header>
    <main className="site-shell workspace-shell">
      <div className="workspace-titlebar">
        <div><span className="section-kicker">ISSUER CONSOLE / NEW RECORD</span><h1>Create an academic certificate</h1><p>Enter the achievement details and review the document specimen before issuing.</p></div>
        <div className="workspace-title-actions"><a className="text-link" href="/verify">Open public verification ↗</a></div>
      </div>
      <CertificateForm />
      <div className="demo-notice" style={{ marginTop: 24 }}><b>PLEASE NOTE</b><span>Use only authorised issuer details. This independent demo is not affiliated with NPTEL, any IIT or SWAYAM. Do not use official logos, signatures or institutional identifiers without permission.</span></div>
    </main>
    <footer className="site-footer"><strong>{issuerName}</strong> · Review names and scores carefully before issuing a record.</footer>
  </>;
}
