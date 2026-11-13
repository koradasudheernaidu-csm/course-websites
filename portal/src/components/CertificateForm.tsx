'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

type CertificateDetails = {
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

type IssuedCertificate = CertificateDetails & {
  certificateId: string;
  issuerName: string;
  recipientName: string;
  courseName: string;
  description: string;
  issueDate: string;
  duration: string;
  status: string;
};

const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'Academic Credential Office';

const initialForm = {
  recipientName: '',
  dateOfBirth: '',
  courseName: '',
  description: '',
  issueDate: new Date().toISOString().slice(0, 10),
  duration: '12 Weeks',
  completionLabel: 'Successfully Completed',
  assignmentScore: '',
  proctoredExamScore: '',
  totalCertified: '',
  sessionPeriod: 'Jul–Nov 2026',
  recommendedCredits: '',
  signatoryOneName: '',
  signatoryOneTitle: 'Programme Director',
  signatoryTwoName: '',
  signatoryTwoTitle: 'Course Coordinator'
};

function displayDate(value: string) {
  if (!value) return 'Date of issue';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function safeNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function initials(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'LC';
}

export default function CertificateForm() {
  const [accessCode, setAccessCode] = useState('');
  const [form, setForm] = useState(initialForm);
  const [issued, setIssued] = useState<IssuedCertificate | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const assignmentScore = safeNumber(form.assignmentScore);
  const examScore = safeNumber(form.proctoredExamScore);
  const totalScore = assignmentScore !== null && examScore !== null
    ? Math.round((assignmentScore + examScore) * 10) / 10
    : null;

  const verificationUrl = useMemo(() => {
    if (!issued || typeof window === 'undefined') return '';
    return `${window.location.origin}/verify/${encodeURIComponent(issued.certificateId)}`;
  }, [issued]);

  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
    setIssued(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setIssued(null);
    setCopied(false);

    if (assignmentScore !== null && (assignmentScore < 0 || assignmentScore > 25)) {
      setError('Assignment score must be between 0 and 25.');
      setBusy(false);
      return;
    }
    if (examScore !== null && (examScore < 0 || examScore > 75)) {
      setError('Proctored exam score must be between 0 and 75.');
      setBusy(false);
      return;
    }

    const payload = {
      ...form,
      assignmentScore,
      proctoredExamScore: examScore,
      totalScore,
      totalCertified: safeNumber(form.totalCertified),
      recommendedCredits: safeNumber(form.recommendedCredits)
    };

    try {
      const response = await fetch('/api/certificates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-issuer-password': accessCode },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Certificate creation failed.');
      setIssued(data.certificate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function copyVerificationLink() {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Your browser could not copy the link. Open the verification page to copy it manually.');
    }
  }

  async function downloadPdf() {
    if (!issued || !verificationUrl) return;

    const qrData = await QRCode.toDataURL(verificationUrl, { width: 720, margin: 1, errorCorrectionLevel: 'H' });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297;
    const H = 210;
    const center = W / 2;
    const red: [number, number, number] = [119, 37, 54];
    const ink: [number, number, number] = [34, 43, 53];
    const muted: [number, number, number] = [104, 111, 119];
    const issueDate = displayDate(issued.issueDate);
    const total = issued.totalScore ?? (issued.assignmentScore != null && issued.proctoredExamScore != null
      ? issued.assignmentScore + issued.proctoredExamScore : null);

    // A formal academic certificate layout, clearly marked as a demonstration.
    doc.setFillColor(250, 248, 243);
    doc.rect(0, 0, W, H, 'F');
    doc.setDrawColor(...red);
    doc.setLineWidth(1.05);
    doc.rect(6.5, 6.5, 284, 197);
    doc.setDrawColor(210, 193, 180);
    doc.setLineWidth(0.3);
    doc.rect(10, 10, 277, 190);

    // Institutional header band and custom, non-official monogram.
    doc.setFillColor(244, 231, 226);
    doc.rect(10, 10, 277, 23, 'F');
    doc.setFillColor(...red);
    doc.circle(23, 21.5, 7.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('LC', 23, 24.3, { align: 'center' });

    doc.setTextColor(...ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.text((issued.issuerName || issuerName).toUpperCase().slice(0, 52), 34, 20.5);
    doc.setTextColor(...red);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text('ACADEMIC CREDENTIAL REGISTER  /  DEMONSTRATION EDITION', 34, 26);

    // Learner identity tile in place of an official institutional portrait mark.
    doc.setDrawColor(192, 164, 151);
    doc.setFillColor(255, 250, 246);
    doc.roundedRect(263, 13.5, 17, 16, 1.2, 1.2, 'FD');
    doc.setTextColor(...red);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(initials(issued.recipientName), 271.5, 23.2, { align: 'center' });

    // Diagonal watermark: intentionally visible on every generated demo certificate.
    doc.setTextColor(239, 226, 220);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(31);
    doc.text('DEMONSTRATION ONLY', 150, 123, { align: 'center', angle: 28 });

    // Main academic certificate content.
    doc.setTextColor(...red);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text((issued.completionLabel || 'SUCCESSFULLY COMPLETED').toUpperCase(), center, 43, { align: 'center' });

    doc.setTextColor(...ink);
    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.text('Academic Online Certification', center, 54, { align: 'center' });

    doc.setTextColor(...muted);
    doc.setFont('times', 'italic');
    doc.setFontSize(10.5);
    doc.text('This demonstration certificate is presented to', center, 66, { align: 'center' });

    doc.setTextColor(29, 39, 49);
    doc.setFont('times', 'bold');
    doc.setFontSize(issued.recipientName.length > 34 ? 18 : 23);
    doc.text(issued.recipientName, center, 79, { align: 'center', maxWidth: 220 });

    doc.setDrawColor(193, 151, 134);
    doc.setLineWidth(0.45);
    doc.line(center - 33, 84, center + 33, 84);

    doc.setTextColor(...muted);
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text('for successfully completing the course', center, 94, { align: 'center' });

    doc.setTextColor(...red);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text(issued.courseName, center, 104, { align: 'center', maxWidth: 225 });

    if (issued.description?.trim()) {
      doc.setTextColor(...muted);
      doc.setFont('times', 'normal');
      doc.setFontSize(7.5);
      doc.text(doc.splitTextToSize(issued.description.trim(), 190).slice(0, 1), center, 110, { align: 'center' });
    }

    // Assessment table, modeled on formal academic result summaries.
    const tableX = 51;
    const tableY = 117;
    const tableW = 195;
    const cellW = tableW / 3;
    doc.setFillColor(246, 239, 235);
    doc.rect(tableX, tableY, tableW, 15, 'F');
    doc.setDrawColor(218, 204, 195);
    doc.setLineWidth(0.25);
    doc.rect(tableX, tableY, tableW, 15);
    doc.line(tableX + cellW, tableY, tableX + cellW, tableY + 15);
    doc.line(tableX + cellW * 2, tableY, tableX + cellW * 2, tableY + 15);

    const scoreCells = [
      ['ONLINE ASSIGNMENTS', issued.assignmentScore == null ? '— / 25' : `${issued.assignmentScore} / 25`],
      ['PROCTORED EXAM', issued.proctoredExamScore == null ? '— / 75' : `${issued.proctoredExamScore} / 75`],
      ['CONSOLIDATED SCORE', total == null ? '— %' : `${total} %`]
    ];
    scoreCells.forEach((cell, index) => {
      const x = tableX + cellW * index + cellW / 2;
      doc.setTextColor(...muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.6);
      doc.text(cell[0], x, tableY + 5.2, { align: 'center' });
      doc.setTextColor(...ink);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text(cell[1], x, tableY + 11.5, { align: 'center' });
    });

    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    const metadata = [
      issued.totalCertified != null ? `Learners certified: ${issued.totalCertified}` : '',
      issued.sessionPeriod || '',
      issued.duration || '',
      issued.recommendedCredits != null ? `Recommended credits: ${issued.recommendedCredits}` : ''
    ].filter(Boolean).join('     ·     ');
    doc.text(metadata || `Issue date: ${issueDate}     ·     ${issued.duration}`, center, 140, { align: 'center', maxWidth: 230 });
    doc.text(`DATE OF ISSUE  ${issueDate}`, center, 147, { align: 'center' });

    // Signatory areas remain role-based unless the issuer supplies names.
    doc.setDrawColor(170, 157, 150);
    doc.setLineWidth(0.3);
    doc.line(37, 169, 99, 169);
    doc.line(122, 169, 184, 169);
    doc.setTextColor(...ink);
    doc.setFont('times', 'bold');
    doc.setFontSize(8.2);
    doc.text(issued.signatoryOneName || 'Authorized Signatory', 68, 174, { align: 'center', maxWidth: 62 });
    doc.text(issued.signatoryTwoName || 'Academic Coordinator', 153, 174, { align: 'center', maxWidth: 62 });
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text(issued.signatoryOneTitle || 'Programme Director', 68, 178.5, { align: 'center', maxWidth: 62 });
    doc.text(issued.signatoryTwoTitle || 'Course Coordinator', 153, 178.5, { align: 'center', maxWidth: 62 });

    // QR is linked to the issuer's live verification page.
    doc.addImage(qrData, 'PNG', 259, 155, 22, 22);
    doc.setTextColor(...red);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text('SCAN TO VERIFY', 270, 181, { align: 'center' });

    // Persistent disclosure strip prevents confusion with an official NPTEL credential.
    doc.setFillColor(...red);
    doc.rect(10, 188.5, 277, 11.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(`DEMO COPY  ·  NOT ISSUED BY NPTEL, ANY IIT OR SWAYAM`, 15, 195.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`CERTIFICATE ID: ${issued.certificateId}`, 282, 195.5, { align: 'right' });

    doc.save(`${issued.certificateId}.pdf`);
  }

  const previewName = form.recipientName.trim() || 'Learner Name';
  const previewCourse = form.courseName.trim() || 'Course or Programme Title';
  const previewIssuer = issued?.issuerName || issuerName;

  return <div className="issuer-workspace">
    <section className="issuer-form-column">
      <div className="workspace-section-head">
        <div><span className="section-kicker">ISSUANCE WORKSPACE / 01</span><h2>Build a credential</h2><p>Complete the learner record. The specimen updates as you type.</p></div>
        <span className="required-chip">Required fields marked *</span>
      </div>

      <form onSubmit={submit} className="issuer-form">
        <div className="form-section">
          <div className="form-section-title"><span className="section-number">01</span><div><h3>Issuer authorisation</h3><p>Only an authorised issuer can create a record.</p></div></div>
          <div className="field dark-field">
            <label htmlFor="accessCode">Private access code <b>*</b></label>
            <input id="accessCode" type="password" autoComplete="current-password" placeholder="Enter issuer access code" value={accessCode} onChange={e => setAccessCode(e.target.value)} required />
            <small>Stored only on the server during verification of this request.</small>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title"><span className="section-number">02</span><div><h3>Learner information</h3><p>Use the learner's name exactly as it should appear.</p></div></div>
          <div className="field"><label htmlFor="recipientName">Full name <b>*</b></label><input id="recipientName" name="recipientName" placeholder="e.g. Aditi Sharma" value={form.recipientName} onChange={update} maxLength={100} required /></div>
          <div className="field two-fields">
            <div><label htmlFor="dateOfBirth">Date of birth <b>*</b></label><input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={update} required /><small>Used for private student matching; not printed on the certificate.</small></div>
            <div><label htmlFor="issueDate">Issue date <b>*</b></label><input id="issueDate" name="issueDate" type="date" value={form.issueDate} onChange={update} required /></div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title"><span className="section-number">03</span><div><h3>Course & result</h3><p>Add the achievement and optional assessment breakdown.</p></div></div>
          <div className="field"><label htmlFor="courseName">Course title <b>*</b></label><input id="courseName" name="courseName" placeholder="e.g. Introduction to Machine Learning" value={form.courseName} onChange={update} maxLength={120} required /></div>
          <div className="field"><label htmlFor="description">Course description <span>(optional)</span></label><textarea id="description" name="description" placeholder="A short description of the course or learning outcome…" value={form.description} onChange={update} maxLength={240} /></div>
          <div className="field two-fields">
            <div><label htmlFor="duration">Course duration <b>*</b></label><input id="duration" name="duration" placeholder="12 Weeks" value={form.duration} onChange={update} maxLength={60} required /></div>
            <div><label htmlFor="sessionPeriod">Academic session</label><input id="sessionPeriod" name="sessionPeriod" placeholder="Jul–Nov 2026" value={form.sessionPeriod} onChange={update} maxLength={60} /></div>
          </div>
          <div className="field two-fields">
            <div><label htmlFor="assignmentScore">Assignment score <span>(out of 25)</span></label><input id="assignmentScore" name="assignmentScore" type="number" min="0" max="25" step="0.01" placeholder="e.g. 22.5" value={form.assignmentScore} onChange={update} /></div>
            <div><label htmlFor="proctoredExamScore">Proctored exam <span>(out of 75)</span></label><input id="proctoredExamScore" name="proctoredExamScore" type="number" min="0" max="75" step="0.01" placeholder="e.g. 48" value={form.proctoredExamScore} onChange={update} /></div>
          </div>
          <div className="field two-fields">
            <div><label htmlFor="completionLabel">Completion category</label><select id="completionLabel" name="completionLabel" value={form.completionLabel} onChange={update}><option>Successfully Completed</option><option>Merit</option><option>Distinction</option></select></div>
            <div><label htmlFor="totalCertified">Learners certified</label><input id="totalCertified" name="totalCertified" type="number" min="0" step="1" placeholder="e.g. 1240" value={form.totalCertified} onChange={update} /></div>
          </div>
          <div className="field"><label htmlFor="recommendedCredits">Recommended academic credits</label><input id="recommendedCredits" name="recommendedCredits" type="number" min="0" max="30" step="1" placeholder="e.g. 3" value={form.recommendedCredits} onChange={update} /></div>
          <div className="score-live"><span>Calculated consolidated score</span><strong>{totalScore === null ? 'Add both score values' : `${totalScore}%`}</strong></div>
        </div>

        <div className="form-section">
          <div className="form-section-title"><span className="section-number">04</span><div><h3>Signatory details</h3><p>Use role labels or authorised names for this demonstration issuer.</p></div></div>
          <div className="field two-fields">
            <div><label htmlFor="signatoryOneName">Signatory 1 name</label><input id="signatoryOneName" name="signatoryOneName" placeholder="e.g. Dr. A. Rao" value={form.signatoryOneName} onChange={update} maxLength={80} /></div>
            <div><label htmlFor="signatoryOneTitle">Signatory 1 designation</label><input id="signatoryOneTitle" name="signatoryOneTitle" value={form.signatoryOneTitle} onChange={update} maxLength={80} /></div>
          </div>
          <div className="field two-fields">
            <div><label htmlFor="signatoryTwoName">Signatory 2 name</label><input id="signatoryTwoName" name="signatoryTwoName" placeholder="e.g. Prof. K. Kumar" value={form.signatoryTwoName} onChange={update} maxLength={80} /></div>
            <div><label htmlFor="signatoryTwoTitle">Signatory 2 designation</label><input id="signatoryTwoTitle" name="signatoryTwoTitle" value={form.signatoryTwoTitle} onChange={update} maxLength={80} /></div>
          </div>
        </div>

        <div className="form-submit-area">
          <p>Issuing saves the certificate record in the shared register. Download the PDF after the record is created.</p>
          <button className="issue-button" type="submit" disabled={busy}>{busy ? 'Creating record…' : 'Issue demonstration certificate'} <span>↗</span></button>
        </div>
      </form>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {issued && <section className="issued-panel" aria-live="polite">
        <div className="issued-panel-title"><span className="issued-check">✓</span><div><strong>Record saved successfully</strong><small>The certificate is now available in the verification register.</small></div></div>
        <div className="issued-id"><span>Certificate reference</span><strong>{issued.certificateId}</strong></div>
        <div className="issued-actions">
          <a href={verificationUrl} target="_blank" rel="noreferrer" className="action-secondary">Open verification page ↗</a>
          <button type="button" className="action-secondary" onClick={copyVerificationLink}>{copied ? 'Copied ✓' : 'Copy verification link'}</button>
          <button type="button" className="action-primary" onClick={downloadPdf}>Download PDF ↓</button>
        </div>
        <div className="issued-qr"><QRCodeSVG value={verificationUrl} size={104} level="H" includeMargin /><span>Scan to view this record</span></div>
      </section>}
    </section>

    <aside className="specimen-column">
      <div className="specimen-heading"><div><span className="section-kicker">LIVE DOCUMENT / 02</span><h2>Certificate specimen</h2></div><span className="live-pill"><i /> LIVE PREVIEW</span></div>
      <div className="specimen-frame">
        <div className="academic-certificate">
          <div className="demo-watermark">DEMO ONLY</div>
          <div className="cert-head-band">
            <div className="cert-emblem">LC</div>
            <div className="cert-issuer"><strong>{previewIssuer}</strong><span>ACADEMIC CREDENTIAL REGISTER</span></div>
            <div className="cert-portrait"><strong>{initials(previewName)}</strong><span>LEARNER</span></div>
          </div>
          <div className="cert-status-tag">{form.completionLabel.toUpperCase()}</div>
          <h3 className="cert-title">Academic Online Certification</h3>
          <p className="cert-awarded">This demonstration certificate is presented to</p>
          <h4 className="cert-recipient">{previewName}</h4>
          <p className="cert-course-lead">for successfully completing the course</p>
          <h5 className="cert-course">{previewCourse}</h5>
          {form.description.trim() && <p className="cert-description">{form.description}</p>}
          <div className="cert-score-grid">
            <div><span>ONLINE ASSIGNMENTS</span><strong>{form.assignmentScore ? `${form.assignmentScore}/25` : '— / 25'}</strong></div>
            <div><span>PROCTORED EXAM</span><strong>{form.proctoredExamScore ? `${form.proctoredExamScore}/75` : '— / 75'}</strong></div>
            <div><span>CONSOLIDATED SCORE</span><strong>{totalScore === null ? '— %' : `${totalScore}%`}</strong></div>
          </div>
          <div className="cert-meta-row"><span>{form.totalCertified || '—'} learners certified</span><span>{form.sessionPeriod || 'Academic session'}</span><span>{form.duration || 'Course duration'}</span></div>
          <div className="cert-signature-row">
            <div><i /><strong>{form.signatoryOneName || 'Authorized Signatory'}</strong><span>{form.signatoryOneTitle || 'Programme Director'}</span></div>
            <div><i /><strong>{form.signatoryTwoName || 'Academic Coordinator'}</strong><span>{form.signatoryTwoTitle || 'Course Coordinator'}</span></div>
            <div className="cert-qr-preview"><QRCodeSVG value={issued ? verificationUrl : 'DEMO-PREVIEW'} size={50} level="M" /><span>SCAN TO VERIFY</span></div>
          </div>
          <div className="cert-footer-band"><span>DEMO COPY · NOT ISSUED BY NPTEL, ANY IIT OR SWAYAM</span><strong>{issued?.certificateId || 'CERTIFICATE ID • GENERATED ON ISSUE'}</strong></div>
        </div>
      </div>
      <div className="specimen-caption"><span>◈</span><p>Layout inspired by traditional online-course certificates. This is an independent demonstration template and does not use official NPTEL marks, logos or signatories.</p></div>
    </aside>
  </div>;
}
