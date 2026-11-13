import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import Certificate from '../models/Certificate.js';
import { requireIssuerKey } from '../middleware/requireIssuerKey.js';

const router = Router();

function optionalNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function publicCertificate(certificate) {
  return {
    certificateId: certificate.certificateId,
    issuerId: certificate.issuerId,
    issuerName: certificate.issuerName,
    recipientName: certificate.recipientName,
    courseName: certificate.courseName,
    description: certificate.description,
    issueDate: certificate.issueDate,
    duration: certificate.duration,
    completionLabel: certificate.completionLabel,
    assignmentScore: certificate.assignmentScore,
    proctoredExamScore: certificate.proctoredExamScore,
    totalScore: certificate.totalScore,
    totalCertified: certificate.totalCertified,
    sessionPeriod: certificate.sessionPeriod,
    recommendedCredits: certificate.recommendedCredits,
    signatoryOneName: certificate.signatoryOneName,
    signatoryOneTitle: certificate.signatoryOneTitle,
    signatoryTwoName: certificate.signatoryTwoName,
    signatoryTwoTitle: certificate.signatoryTwoTitle,
    status: certificate.status
  };
}

router.post('/create', requireIssuerKey, async (req, res, next) => {
  try {
    const body = req.body || {};
    const {
      issuerId, issuerName, recipientName, dateOfBirth, courseName,
      description = '', issueDate, duration,
      completionLabel = 'Successfully Completed', sessionPeriod = '',
      signatoryOneName = '', signatoryOneTitle = 'Programme Director',
      signatoryTwoName = '', signatoryTwoTitle = 'Course Coordinator'
    } = body;

    const required = { issuerId, issuerName, recipientName, dateOfBirth, courseName, issueDate, duration };
    const missing = Object.entries(required)
      .filter(([, value]) => !String(value ?? '').trim())
      .map(([key]) => key);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    const parsedIssueDate = new Date(issueDate);
    if (Number.isNaN(parsedIssueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'issueDate must be a valid date.' });
    }

    const assignmentScore = optionalNumber(body.assignmentScore);
    const proctoredExamScore = optionalNumber(body.proctoredExamScore);
    const totalCertified = optionalNumber(body.totalCertified);
    const recommendedCredits = optionalNumber(body.recommendedCredits);
    const totalScore = optionalNumber(body.totalScore);

    if (Number.isNaN(assignmentScore) || (assignmentScore !== null && (assignmentScore < 0 || assignmentScore > 25))) {
      return res.status(400).json({ success: false, message: 'Assignment score must be between 0 and 25.' });
    }
    if (Number.isNaN(proctoredExamScore) || (proctoredExamScore !== null && (proctoredExamScore < 0 || proctoredExamScore > 75))) {
      return res.status(400).json({ success: false, message: 'Proctored exam score must be between 0 and 75.' });
    }
    if (Number.isNaN(totalCertified) || (totalCertified !== null && totalCertified < 0)) {
      return res.status(400).json({ success: false, message: 'Learners certified must be a non-negative number.' });
    }
    if (Number.isNaN(recommendedCredits) || (recommendedCredits !== null && (recommendedCredits < 0 || recommendedCredits > 30))) {
      return res.status(400).json({ success: false, message: 'Recommended credits must be between 0 and 30.' });
    }

    const computedTotal = assignmentScore !== null && proctoredExamScore !== null
      ? Math.round((assignmentScore + proctoredExamScore) * 10) / 10
      : totalScore;
    if (computedTotal !== null && (Number.isNaN(computedTotal) || computedTotal < 0 || computedTotal > 100)) {
      return res.status(400).json({ success: false, message: 'Consolidated score must be between 0 and 100.' });
    }

    const year = parsedIssueDate.getFullYear();
    const suffix = randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase();
    const safeIssuerId = String(issuerId).trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-');
    const certificateId = `${safeIssuerId}-${year}-${suffix}`;

    const certificate = await Certificate.create({
      certificateId,
      issuerId: String(issuerId).trim(),
      issuerName: String(issuerName).trim(),
      recipientName: String(recipientName).trim(),
      dateOfBirth: String(dateOfBirth).trim(),
      courseName: String(courseName).trim(),
      description: String(description).trim(),
      issueDate: parsedIssueDate,
      duration: String(duration).trim(),
      completionLabel: String(completionLabel).trim(),
      assignmentScore,
      proctoredExamScore,
      totalScore: computedTotal,
      totalCertified,
      sessionPeriod: String(sessionPeriod).trim(),
      recommendedCredits,
      signatoryOneName: String(signatoryOneName).trim(),
      signatoryOneTitle: String(signatoryOneTitle).trim(),
      signatoryTwoName: String(signatoryTwoName).trim(),
      signatoryTwoTitle: String(signatoryTwoTitle).trim(),
      status: 'VALID'
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate record created.',
      certificate: publicCertificate(certificate)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:certificateId', async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId }).lean();
    if (!certificate) {
      return res.status(404).json({ success: false, status: 'NOT_FOUND', message: 'No matching certificate record was found.' });
    }
    return res.status(200).json({
      success: true,
      status: certificate.status,
      message: certificate.status === 'VALID'
        ? 'A matching certificate record exists and is currently marked valid in the issuer register.'
        : 'This certificate has been revoked.',
      certificate: publicCertificate(certificate)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/revoke/:certificateId', async (req, res, next) => {
  try {
    const issuerId = String(req.body?.issuerId || '').trim();
    const fakeReq = { ...req, body: { issuerId }, get: req.get.bind(req) };
    requireIssuerKey(fakeReq, res, async () => {
      try {
        const updated = await Certificate.findOneAndUpdate(
          { certificateId: req.params.certificateId, issuerId },
          { $set: { status: 'REVOKED' } },
          { new: true }
        ).lean();
        if (!updated) return res.status(404).json({ success: false, message: 'Certificate not found for this issuer.' });
        return res.json({ success: true, status: 'REVOKED', certificateId: updated.certificateId });
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
