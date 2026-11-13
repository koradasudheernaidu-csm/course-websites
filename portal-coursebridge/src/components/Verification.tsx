'use client';

import { FormEvent, useEffect, useState } from 'react';

type CertificateRecord = {
  certificateId: string;
  issuerId: string;
  issuerName: string;
  recipientName: string;
  courseName: string;
  description?: string;
  issueDate: string;
  duration: string;
  completionLabel?: string;
  status: string;
};

type VerifyResponse = {
  success: boolean;
  status: string;
  message: string;
  certificate?: CertificateRecord;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Verification({ initialId = '' }: { initialId?: string }) {
  const [id, setId] = useState(initialId);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function verify(reference: string) {
    const clean = reference.trim();
    if (!clean) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(clean)}`, { cache: 'no-store' });
      const data = await response.json() as VerifyResponse;
      setResult(data);
    } catch {
      setError('The certificate register could not be reached. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { if (initialId) void verify(initialId); // eslint-disable-line react-hooks/exhaustive-deps
  }, [initialId]);

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void verify(id); }

  const status = result?.status?.toUpperCase() || '';
  const valid = status === 'VALID';
  const revoked = status === 'REVOKED';
  const found = Boolean(result?.certificate);
  const stateClass = valid ? 'cb-state-valid' : revoked ? 'cb-state-revoked' : 'cb-state-invalid';
  const title = valid ? 'Certificate record found' : revoked ? 'This certificate has been revoked' : status === 'NOT_FOUND' ? 'No matching certificate record' : 'Verification could not be completed';

  return <section className="cb-verification-module">
    <div className="cb-verification-card">
      <div className="cb-verification-card-head"><span className="cb-verify-icon">⌕</span><div><span className="cb-kicker">COURSE CERTIFICATE LOOKUP</span><h2>Check a certificate</h2><p>Enter the unique reference printed on the document.</p></div></div>
      <form className="cb-lookup-form" onSubmit={submit}><label htmlFor="certificateId">Certificate reference</label><div><input id="certificateId" value={id} onChange={event => setId(event.target.value)} placeholder="e.g. COURSEBRIDGE-DEMO-2026-XXXXXXXXXX" required /><button className="cb-button cb-button-primary" disabled={busy}>{busy ? 'Checking…' : 'Verify certificate'} <span>→</span></button></div><small>You can also reach this page by scanning the QR code printed on a sample certificate.</small></form>
      {busy && <div className="cb-lookup-progress"><i /> Contacting the CourseBridge demonstration register…</div>}
      {error && <div className="cb-lookup-error" role="alert">{error}</div>}
      {result && <div className={`cb-lookup-result ${stateClass}`} aria-live="polite"><div className="cb-result-banner"><span className="cb-result-symbol">{valid ? '✓' : revoked ? '!' : '×'}</span><div><small>REGISTER RESPONSE</small><h3>{title}</h3><p>{result.message}</p></div><b className="cb-status-label">{status || 'ERROR'}</b></div>
        {found && result.certificate && <div className="cb-found-record"><div className="cb-record-top"><div><small>COURSE CERTIFICATE / DEMONSTRATION</small><strong>{result.certificate.certificateId}</strong></div><span className="cb-record-mark">CB.</span></div><div className="cb-record-recipient"><small>THIS RECORD IS REGISTERED TO</small><h3>{result.certificate.recipientName}</h3><p>has successfully completed</p><h4>{result.certificate.courseName}</h4></div><div className="cb-record-details"><div><small>ISSUING DEMO PORTAL</small><b>{result.certificate.issuerName}</b></div><div><small>COMPLETION DATE</small><b>{formatDate(result.certificate.issueDate)}</b></div><div><small>COURSE DURATION</small><b>{result.certificate.duration}</b></div><div><small>RECORD STATUS</small><b>{result.certificate.status}</b></div></div>{result.certificate.description && <div className="cb-record-description"><small>COURSE DETAILS</small><p>{result.certificate.description}</p></div>}<div className="cb-record-disclaimer">DEMONSTRATION RECORD · NOT AN OFFICIAL COURSERA CERTIFICATE</div></div>}
      </div>}
    </div>
    <aside className="cb-verification-explainer"><span>i</span><p><b>What this verification means</b>A successful lookup confirms that this demonstration system has a matching database record and reports its stored status. It does not verify a cryptographic signature, establish partner identity, or confirm issuance by Coursera.</p></aside>
  </section>;
}
