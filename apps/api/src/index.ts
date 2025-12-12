import express from 'express';
import cors from 'cors';
import { convertRouter } from './routes/convert';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow requests from frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Video conversion routes
app.use('/api', convertRouter);

app.listen(PORT, () => {
    console.log(`🚀 ScreenREC API running on port ${PORT}`);
});
