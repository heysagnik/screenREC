import express from 'express';
import cors from 'cors';
import { convertRouter } from './routes/convert';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway/reverse proxy deployments
// This fixes the X-Forwarded-For header validation error in express-rate-limit
app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', convertRouter);

app.listen(PORT, () => {
    console.log(`🚀 ScreenREC API running on port ${PORT}`);
});
