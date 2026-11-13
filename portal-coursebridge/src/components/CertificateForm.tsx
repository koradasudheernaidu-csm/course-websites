'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

type IssuedCertificate = {
  certificateId: string;
  issuerName: string;
  recipientName: string;
  courseName: string;
  description: string;
  issueDate: string;
  duration: string;
  completionLabel?: string;
  signatoryOneName?: string;
  signatoryOneTitle?: string;
  status: string;
};

type FormState = {
  recipientName: string;
  dateOfBirth: string;
  partnerInstitution: string;
  courseName: string;
  description: string;
  issueDate: string;
  duration: string;
  instructorName: string;
  instructorTitle: string;
};

const initialForm: FormState = {
  recipientName: '',
  dateOfBirth: '',
  partnerInstitution: 'Northstar University',
  courseName: '',
  description: '',
  issueDate: new Date().toISOString().slice(0, 10),
  duration: '6 weeks',
  instructorName: '',
  instructorTitle: 'Course Instructor'
};

function dateLabel(value: string) {
  if (!value) return 'Completion date';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function partnerInitials(value: string) {
  const initials = value.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  return initials || 'LP';
}

export default function CertificateForm() {
  const [accessCode, setAccessCode] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);
  const [issued, setIssued] = useState<IssuedCertificate | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const verificationUrl = useMemo(() => issued && typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${encodeURIComponent(issued.certificateId)}` : '', [issued]);

  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
    setIssued(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setIssued(null); setCopied(false);

    const partnerDescription = `Course partner: ${form.partnerInstitution.trim()}. Course format: online non-credit course.${form.description.trim() ? ` Additional information: ${form.description.trim()}` : ''}`;
    const payload = {
      recipientName: form.recipientName.trim(),
      dateOfBirth: form.dateOfBirth,
      courseName: form.courseName.trim(),
      description: partnerDescription,
      issueDate: form.issueDate,
      duration: form.duration.trim(),
      completionLabel: 'Successfully Completed',
      sessionPeriod: '',
      signatoryOneName: form.instructorName.trim(),
      signatoryOneTitle: form.instructorTitle.trim() || 'Course Instructor',
      signatoryTwoName: '',
      signatoryTwoTitle: ''
    };

    try {
      const response = await fetch('/api/certificates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-issuer-password': accessCode },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Certificate creation failed.');
      setIssued(data.certificate as IssuedCertificate);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong while issuing the record.');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy the link. Open the verification page and copy its address instead.');
    }
  }

  async function downloadPdf() {
    if (!issued || !verificationUrl) return;
    const qrImage = await QRCode.toDataURL(verificationUrl, { width: 720, margin: 1, errorCorrectionLevel: 'H' });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;
    const ink: [number, number, number] = [48, 58, 72];
    const blue: [number, number, number] = [28, 91, 150];
    const muted: [number, number, number] = [112, 122, 135];
    const pale: [number, number, number] = [238, 243, 248];
    const blueLight: [number, number, number] = [225, 237, 248];
    const issuedDate = dateLabel(issued.issueDate.slice(0, 10));
    const partner = form.partnerInstitution.trim() || 'Learning Partner';
    const initials = partnerInitials(partner);

    // Certificate inspired by common online-course credential layouts; all marks are original demo artwork.
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
    doc.setDrawColor(211, 219, 228); doc.setLineWidth(0.45); doc.rect(5, 5, W - 10, H - 10);
    doc.setDrawColor(234, 238, 243); doc.setLineWidth(0.25); doc.rect(8, 8, W - 16, H - 16);
    // Quiet security-style background pattern, kept intentionally abstract.
    doc.setDrawColor(244, 247, 250); doc.setLineWidth(0.22);
    doc.setTextColor(239, 243, 249); doc.setFont('helvetica', 'bold'); doc.setFontSize(42);
    doc.text('SAMPLE', 112, 117, { align: 'center', angle: -19 });
    for (let x = 16; x < 220; x += 13) {
      doc.line(x, 16, x + 34, 190);
      doc.line(x + 34, 16, x, 190);
    }
    // Right-side certificate ribbon.
    doc.setFillColor(...pale); doc.rect(224, 8, 65, 194, 'F');
    doc.setFillColor(231, 237, 244); doc.triangle(224, 190, 289, 190, 256.5, 202, 'F');
    doc.setDrawColor(210, 220, 231); doc.line(224, 8, 224, 190);

    // Partner text identity tile (not a third-party logo).
    doc.setFillColor(...blue); doc.roundedRect(18, 18, 19, 19, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(initials, 27.5, 30.2, { align: 'center' });
    doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(partner.toUpperCase().slice(0, 42), 43, 24);
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2); doc.text('LEARNING PARTNER · DEMONSTRATION', 43, 30);
    doc.setTextColor(...muted); doc.setFontSize(7); doc.text(issuedDate, 207, 25, { align: 'right' });

    // Course completion content.
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('COURSE CERTIFICATE', 114, 56, { align: 'center' });
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('This is to certify that', 114, 72, { align: 'center' });
    doc.setTextColor(...ink); doc.setFont('helvetica', 'normal'); doc.setFontSize(25); doc.text(issued.recipientName, 114, 88, { align: 'center', maxWidth: 180 });
    doc.setDrawColor(179, 197, 216); doc.setLineWidth(0.5); doc.line(65, 95, 163, 95);
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('has successfully completed', 114, 107, { align: 'center' });
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text(issued.courseName, 114, 121, { align: 'center', maxWidth: 180 });
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const authLine = `Course information supplied by ${partner}. This sample record is part of CourseBridge Learning Demo.`;
    doc.text(doc.splitTextToSize(authLine, 172).slice(0, 2), 114, 133, { align: 'center' });

    // Typed instructor attribution only; no simulated handwritten signature.
    doc.setDrawColor(144, 156, 170); doc.setLineWidth(0.3); doc.line(24, 174, 91, 174);
    doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.7);
    doc.text(issued.signatoryOneName || 'Course Instructor', 24, 180);
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8);
    doc.text(issued.signatoryOneTitle || 'Course Instructor', 24, 185);
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
    doc.text('VERIFY THIS DEMONSTRATION RECORD', 24, 191);
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.7);
    doc.text(verificationUrl, 24, 195, { maxWidth: 184 });

    // CourseBridge demo ribbon and seal; not Coursera artwork.
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.text('COURSE CERTIFICATE', 256.5, 29, { align: 'center' });
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); doc.text('LEARNING RECORD / SAMPLE', 256.5, 35, { align: 'center' });
    doc.setDrawColor(112, 151, 187); doc.setLineWidth(0.8); doc.circle(256.5, 84, 22);
    doc.setDrawColor(174, 195, 215); doc.setLineWidth(0.45); doc.circle(256.5, 84, 18.3);
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('CB', 256.5, 87, { align: 'center' });
    doc.setTextColor(...muted); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.2); doc.text('COURSEBRIDGE', 256.5, 96, { align: 'center' });
    doc.addImage(qrImage, 'PNG', 243, 124, 27, 27);
    doc.setTextColor(...blue); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.2); doc.text('SCAN TO CHECK RECORD', 256.5, 155, { align: 'center' });
    doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.3); doc.text('REFERENCE', 256.5, 165, { align: 'center' });
    doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.4); doc.text(issued.certificateId, 256.5, 170, { align: 'center', maxWidth: 58 });
    doc.setTextColor(156, 74, 65); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.2); doc.text('DEMONSTRATION ONLY', 256.5, 181, { align: 'center' });

    doc.setFillColor(28, 91, 150); doc.rect(8, 202, W - 16, 1.8, 'F');
    doc.setTextColor(146, 85, 78); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.4);
    doc.text('SAMPLE ONLY · NOT ISSUED BY COURSERA OR THE NAMED PARTNER INSTITUTION', 148.5, 208, { align: 'center' });
    doc.save(`${issued.certificateId}.pdf`);
  }

  const previewName = form.recipientName.trim() || 'Learner Name';
  const previewCourse = form.courseName.trim() || 'Course title';
  const partner = form.partnerInstitution.trim() || 'Learning Partner';

  return <div className="cb-issuer-layout">
    <section className="cb-form-card">
      <div className="cb-form-card-head"><div><span className="cb-kicker">ISSUER CONSOLE / NEW RECORD</span><h2>Course certificate details</h2><p>Complete the course and learner information shown on the certificate.</p></div><span className="cb-form-step">01 <i>/ 03</i></span></div>
      <form onSubmit={submit} className="cb-issuer-form">
        <div className="cb-form-section"><div className="cb-form-section-title"><span>01</span><div><b>Issuer access</b><small>Private authorisation for this demonstration workspace.</small></div></div><label className="cb-field"><span>Issuer access code <i>*</i></span><input type="password" autoComplete="current-password" value={accessCode} onChange={event => setAccessCode(event.target.value)} placeholder="Enter private issuer access code" required /><small>This value is used for authorisation only. It is not stored in the certificate.</small></label></div>
        <div className="cb-form-section"><div className="cb-form-section-title"><span>02</span><div><b>Learner information</b><small>Enter the name exactly as it should appear.</small></div></div><label className="cb-field"><span>Learner full name <i>*</i></span><input name="recipientName" value={form.recipientName} onChange={update} maxLength={100} placeholder="e.g. Alex Morgan" required /></label><div className="cb-field-grid"><label className="cb-field"><span>Date of birth <i>*</i></span><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={update} required /><small>Used for private wallet matching; not printed.</small></label><label className="cb-field"><span>Completion date <i>*</i></span><input type="date" name="issueDate" value={form.issueDate} onChange={update} required /></label></div></div>
        <div className="cb-form-section"><div className="cb-form-section-title"><span>03</span><div><b>Course information</b><small>Course certificate details and partner attribution.</small></div></div><label className="cb-field"><span>Course title <i>*</i></span><input name="courseName" value={form.courseName} onChange={update} maxLength={120} placeholder="e.g. Introduction to Data Analytics" required /></label><label className="cb-field"><span>Partner university or organisation <i>*</i></span><input name="partnerInstitution" value={form.partnerInstitution} onChange={update} maxLength={100} placeholder="e.g. Northstar University" required /></label><div className="cb-field-grid"><label className="cb-field"><span>Course duration <i>*</i></span><input name="duration" value={form.duration} onChange={update} maxLength={60} placeholder="e.g. 6 weeks" required /></label><label className="cb-field"><span>Instructor name</span><input name="instructorName" value={form.instructorName} onChange={update} maxLength={80} placeholder="Optional" /></label></div><label className="cb-field"><span>Instructor designation</span><input name="instructorTitle" value={form.instructorTitle} onChange={update} maxLength={80} placeholder="e.g. Professor of Computer Science" /></label><label className="cb-field"><span>Additional course description</span><textarea name="description" value={form.description} onChange={update} rows={3} maxLength={240} placeholder="Optional short description of the course." /></label></div>
        {error && <div className="cb-form-error" role="alert">{error}</div>}
        <div className="cb-form-submit"><div><b>Ready to create the record?</b><small>The API saves the certificate record to the shared MongoDB registry.</small></div><button className="cb-button cb-button-primary" type="submit" disabled={busy}>{busy ? 'Saving record…' : 'Create certificate'} <span>→</span></button></div>
      </form>
      {issued && <section className="cb-issued-card" aria-live="polite"><div className="cb-issued-success"><span>✓</span><div><b>Certificate record created</b><small>The record is available in the shared demonstration register.</small></div></div><div className="cb-issued-reference"><small>CERTIFICATE REFERENCE</small><strong>{issued.certificateId}</strong></div><div className="cb-issued-bottom"><QRCodeSVG value={verificationUrl} size={96} level="H" includeMargin /><div><b>Your certificate is ready</b><p>Download the sample PDF or share the verification link.</p><a href={verificationUrl} target="_blank" rel="noreferrer">Open verification page ↗</a><button type="button" onClick={copyLink}>{copied ? 'Link copied ✓' : 'Copy verification link'}</button><button type="button" className="cb-download-button" onClick={downloadPdf}>Download certificate PDF ↓</button></div></div></section>}
    </section>

    <aside className="cb-preview-panel"><div className="cb-preview-heading"><div><span className="cb-kicker">DOCUMENT PREVIEW</span><h2>Course certificate</h2></div><span className="cb-live-indicator"><i /> LIVE PREVIEW</span></div>
      <div className="cb-preview-canvas"><div className="cb-certificate-preview"><div className="cb-preview-pattern" /><aside className="cb-preview-ribbon"><b>COURSE<br />CERTIFICATE</b><small>LEARNING RECORD / SAMPLE</small><div className="cb-preview-seal"><span>CB</span><small>COURSEBRIDGE</small></div><div className="cb-preview-qr-placeholder">▦</div><small>DEMO REFERENCE</small><em>NOT OFFICIAL</em></aside><div className="cb-preview-main"><div className="cb-preview-partner"><span>{partnerInitials(partner)}</span><div><b>{partner.toUpperCase()}</b><small>LEARNING PARTNER · DEMONSTRATION</small></div><time>{dateLabel(form.issueDate)}</time></div><div className="cb-preview-content"><span className="cb-preview-kicker">COURSE CERTIFICATE · SAMPLE</span><p>This is to certify that</p><h3>{previewName}</h3><div className="cb-preview-rule" /><p>has successfully completed</p><h4>{previewCourse}</h4><small>a non-credit online course recorded by {partner} in the CourseBridge Learning Demo.</small></div><div className="cb-preview-signature"><span><i />{form.instructorName || 'Course Instructor'}<small>{form.instructorTitle || 'Course Instructor'}</small></span><b>DEMONSTRATION<br />ONLY</b></div><div className="cb-preview-footer">NOT ISSUED BY COURSERA OR THE NAMED LEARNING PARTNER</div></div><div className="cb-preview-watermark">SAMPLE</div></div></div>
      <div className="cb-preview-note"><span>ⓘ</span><p>The QR code and certificate reference are added after the record is saved. This sample design does not reproduce Coursera's logo, seal or official certificate.</p></div><div className="cb-preview-specs"><div><span>PAGE</span><b>A4 Landscape</b></div><div><span>RECORD</span><b>Shared MongoDB</b></div><div><span>LOOKUP</span><b>QR + Reference ID</b></div></div>
    </aside>
  </div>;
}
