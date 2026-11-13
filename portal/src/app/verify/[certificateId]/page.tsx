import Verification from '@/components/Verification';

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'Academic Credential Office';

export default async function VerifyCertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  return <>
    <header className="site-header">
      <nav className="site-nav">
        <a className="site-brand" href="/"><span className="site-brand-mark">LC</span><span className="site-brand-copy"><strong>{issuerName}</strong><small>QR certificate verification</small></span></a>
        <div className="site-nav-links"><a href="/">Home</a><a href="/verify">Manual lookup</a></div>
      </nav>
    </header>
    <div className="site-shell"><Verification initialId={certificateId} /></div>
    <footer className="site-footer"><strong>{issuerName}</strong> · Public database record lookup</footer>
  </>;
}
