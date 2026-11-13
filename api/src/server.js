import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import certificateRoutes from './routes/certificates.js';

const app = express();
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((s) => s.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-issuer-key']
}));
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => res.json({ service: 'Learner Credential API', status: 'running' }));
app.get('/api/health', (_req, res) => res.json({ service: 'Learner Credential API', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/certificates', certificateRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.message === 'Origin not allowed by CORS') return res.status(403).json({ success: false, message: err.message });
  if (err?.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate certificate ID. Please retry.' });
  return res.status(500).json({ success: false, message: 'Server error.' });
});

const port = Number(process.env.PORT || 5000);
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is missing. Configure it in the environment before starting the API.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`API listening on port ${port}`));
} catch (error) {
  console.error('Could not connect to MongoDB:', error);
  process.exit(1);
}
