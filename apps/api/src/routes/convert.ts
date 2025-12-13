import { Router, type Router as RouterType } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import sanitize from 'sanitize-filename';

const execFileAsync = promisify(execFile);
const router: RouterType = Router();

const TEMP_DIR = path.join(os.tmpdir(), 'screenrec');

const convertLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per window
    message: { error: 'Too many conversion requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const upload = multer({
    storage: multer.diskStorage({
        destination: TEMP_DIR,
        filename: (req, file, cb) => {
            const uniqueId = crypto.randomBytes(8).toString('hex');
            const safeName = sanitize(file.originalname) || 'video.webm';
            cb(null, `${uniqueId}-${safeName}`);
        },
    }),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept video/* mimetypes
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
            return;
        }
        // Also accept application/octet-stream (browsers sometimes send this)
        if (file.mimetype === 'application/octet-stream') {
            cb(null, true);
            return;
        }
        // Accept files with video extensions
        const videoExtensions = ['.webm', '.mp4', '.mkv', '.avi', '.mov', '.wmv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (videoExtensions.includes(ext)) {
            cb(null, true);
            return;
        }
        console.error(`Rejected file: ${file.originalname} (mimetype: ${file.mimetype})`);
        cb(new Error(`Only video files are allowed. Received: ${file.mimetype}`));
    },
});

async function ensureTempDir() {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch {
    }
}

async function cleanupOldFiles() {
    try {
        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtimeMs > tenMinutes) {
                await fs.unlink(filePath);
                console.log(`Cleaned up: ${file}`);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

setInterval(cleanupOldFiles, 5 * 60 * 1000);

router.post('/convert', convertLimiter, upload.single('video'), async (req, res) => {
    await ensureTempDir();

    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    const inputPath = req.file.path;

    const baseName = path.parse(req.file.filename).name;
    const safeBaseName = sanitize(baseName) || 'output';
    const outputFilename = `${safeBaseName}.mp4`;
    const outputPath = path.join(TEMP_DIR, outputFilename);

    const resolvedInput = path.resolve(inputPath);
    const resolvedOutput = path.resolve(outputPath);
    const resolvedTempDir = path.resolve(TEMP_DIR);

    if (!resolvedInput.startsWith(resolvedTempDir) || !resolvedOutput.startsWith(resolvedTempDir)) {
        return res.status(400).json({ error: 'Invalid file path' });
    }

    try {
        const ffmpegArgs = [
            '-i', inputPath,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            '-y', // Overwrite output
            outputPath,
        ];

        console.log(`Converting: ${req.file.originalname}`);
        await execFileAsync('ffmpeg', ffmpegArgs);

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);

        const fileStream = await fs.readFile(outputPath);
        res.send(fileStream);

        await fs.unlink(inputPath);
        console.log(`Conversion complete: ${outputFilename}`);

    } catch (error) {
        console.error('Conversion error:', error);

        try {
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);
        } catch { }

        return res.status(500).json({
            error: 'Video conversion failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'screenrec-api' });
});

export { router as convertRouter };
