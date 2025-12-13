import express from 'express';
import cors from 'cors';
import { convertRouter } from './routes/convert';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

const allowedOrigins = [
    'http://localhost:3000',
    'https://screen-rec.vercel.app',
    'https://screen-rec-web.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
