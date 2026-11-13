'use client';

import { FormEvent, useEffect, useState } from 'react';

type VerifyData = {
  success: boolean;
  status: string;
  message: string;
  certificate?: {
    certificateId: string;
    issuerName: string;
    recipientName: string;
    courseName: string;
    description: string;
    issueDate: string;
    duration: string;
    status: string;
    assignmentScore?: number | null;
    proctoredExamScore?: number | null;
    totalScore?: number | null;
    totalCertified?: number | null;
    completionLabel?: string;
    sessionPeriod?: string;
    recommendedCredits?: number | null;
    signatoryOneName?: string;
    signatoryOneTitle?: string;
    signatoryTwoName?: string;
    signatoryTwoTitle?: string;
  };
};

function formattedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export default function Verification({ initialId = '' }: { initialId?: string }) {
  const [id, setId] = useState(initialId);
  const [data, setData] = useState<VerifyData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function verify(certificateId: string) {
    if (!certificateId.trim()) return;
    setBusy(true);
    setError('');
    setData(null);
    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(certificateId.trim())}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
    } catch {
      setError('Could not contact the verification service. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialId) void verify(initialId);
    // QR route should perform its lookup once when loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verify(id);
  }

  const status = data?.status?.toUpperCase() || '';
  const valid = status === 'VALID';
  const revoked = status === 'REVOKED';
  const notFound = status === 'NOT_FOUND';
  const stateClass = valid ? 'valid' : revoked ? 'revoked' : 'invalid';
  const heading = valid ? 'RECORD FOUND · CURRENTLY VALID'
    : revoked ? 'CERTIFICATE REVOKED'
      : notFound ? 'CERTIFICATE NOT FOUND'
        : 'VERIFICATION COULD NOT BE COMPLETED';
  const symbol = valid ? '✓' : revoked ? '!' : '×';
  const certificate = data?.certificate;
  const calculatedTotal = certificate?.totalScore ?? (certificate?.assignmentScore != null && certificate?.proctoredExamScore != null
    ? certificate.assignmentScore + certificate.proctoredExamScore : null);

  return <main className="verify-shell">
    <div className="verify-intro">
      <span className="section-kicker">PUBLIC CERTIFICATE REGISTER</span>
      <h1>Verify an academic record</h1>
      <p>Enter the certificate reference printed on the document, or scan its QR code to open this page with the reference pre-filled.</p>
    </div>

    <section className="verify-box">
      <form onSubmit={submit} className="verify-search">
        <input aria-label="Certificate ID" placeholder="e.g. NPTEL-DEMO-2026-XXXXXXXXXX" value={id} onChange={event => setId(event.target.value)} required />
        <button disabled={busy}>{busy ? 'Checking register…' : 'Verify record  ↗'}</button>
      </form>

      {error && <div className="error-box" role="alert">{error}</div>}
      {busy && <div className="loading-line" role="status">Searching the issuer's certificate register…</div>}

      {data && <section aria-live="polite">
        <div className={`verify-status ${stateClass}`}>
          <span className="verify-status-icon" aria-hidden="true">{symbol}</span>
          <div><h2>{heading}</h2><p>{data.message}</p></div>
        </div>
        {certificate && <div className="verify-data-grid">
          <div className="verify-data"><span>Certificate reference</span><strong>{certificate.certificateId}</strong></div>
          <div className="verify-data"><span>Issuing organisation</span><strong>{certificate.issuerName}</strong></div>
          <div className="verify-data"><span>Learner</span><strong>{certificate.recipientName}</strong></div>
          <div className="verify-data"><span>Course / programme</span><strong>{certificate.courseName}</strong></div>
          <div className="verify-data"><span>Completion category</span><strong>{certificate.completionLabel || 'Successfully Completed'}</strong></div>
          <div className="verify-data"><span>Issue date</span><strong>{formattedDate(certificate.issueDate)}</strong></div>
          <div className="verify-data"><span>Assignment score</span><strong>{certificate.assignmentScore == null ? 'Not supplied' : `${certificate.assignmentScore} / 25`}</strong></div>
          <div className="verify-data"><span>Proctored examination</span><strong>{certificate.proctoredExamScore == null ? 'Not supplied' : `${certificate.proctoredExamScore} / 75`}</strong></div>
          <div className="verify-data"><span>Consolidated score</span><strong>{calculatedTotal == null ? 'Not supplied' : `${calculatedTotal}%`}</strong></div>
          <div className="verify-data"><span>Course duration</span><strong>{certificate.duration}</strong></div>
          {certificate.sessionPeriod && <div className="verify-data"><span>Academic session</span><strong>{certificate.sessionPeriod}</strong></div>}
          {certificate.totalCertified != null && <div className="verify-data"><span>Learners certified</span><strong>{certificate.totalCertified}</strong></div>}
          {certificate.recommendedCredits != null && <div className="verify-data"><span>Recommended credits</span><strong>{certificate.recommendedCredits}</strong></div>}
          <div className="verify-data"><span>Current register status</span><strong>{certificate.status}</strong></div>
        </div>}
      </section>}
    </section>

    <div className="verify-note">This page checks whether the issuer's database contains a matching record and reports its current status. It does not, by itself, prove a cryptographic signature or represent an official NPTEL verification result.</div>
  </main>;
}
