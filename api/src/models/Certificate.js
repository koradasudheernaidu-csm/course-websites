import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true, index: true },
  issuerId: { type: String, required: true, index: true },
  issuerName: { type: String, required: true },
  recipientName: { type: String, required: true, trim: true },
  dateOfBirth: { type: String, required: true, select: false },
  courseName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  issueDate: { type: Date, required: true },
  duration: { type: String, required: true },
  completionLabel: { type: String, default: 'Successfully Completed' },
  assignmentScore: { type: Number, min: 0, max: 25, default: null },
  proctoredExamScore: { type: Number, min: 0, max: 75, default: null },
  totalScore: { type: Number, min: 0, max: 100, default: null },
  totalCertified: { type: Number, min: 0, default: null },
  sessionPeriod: { type: String, default: '' },
  recommendedCredits: { type: Number, min: 0, max: 30, default: null },
  signatoryOneName: { type: String, default: '' },
  signatoryOneTitle: { type: String, default: 'Programme Director' },
  signatoryTwoName: { type: String, default: '' },
  signatoryTwoTitle: { type: String, default: 'Course Coordinator' },
  status: { type: String, enum: ['VALID', 'REVOKED'], default: 'VALID', index: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Certificate', certificateSchema);
