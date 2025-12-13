import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import sanitize from 'sanitize-filename';

const TEMP_DIR = path.join(os.tmpdir(), 'screenrec');
const VIDEO_EXTENSIONS = ['.webm', '.mp4', '.mkv', '.avi', '.mov', '.wmv'] as const;

const UPLOAD_CONFIG = {
    maxFileSizeBytes: 500 * 1024 * 1024,
    cleanupIntervalMs: 5 * 60 * 1000,
    fileMaxAgeMs: 10 * 60 * 1000,
} as const;

const FFMPEG_CONFIG = {
    timeoutMs: 5 * 60 * 1000,
    threads: 2,
    preset: 'ultrafast',
    tune: 'zerolatency',
    crf: 28,
    maxVideoBitrate: '2M',
    bufferSize: '1M',
    audioBitrate: '128k',
    audioChannels: 2,
} as const;

const router: ReturnType<typeof Router> = Router();

const convertLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Too many conversion requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

function isValidVideoFile(mimetype: string, filename: string): boolean {
    if (mimetype.startsWith('video/')) return true;
    if (mimetype === 'application/octet-stream') return true;
    const ext = path.extname(filename).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext as typeof VIDEO_EXTENSIONS[number]);
}

const upload = multer({
    storage: multer.diskStorage({
        destination: TEMP_DIR,
        filename: (_req, file, cb) => {
            const uniqueId = crypto.randomBytes(8).toString('hex');
            const safeName = sanitize(file.originalname) || 'video.webm';
            cb(null, `${uniqueId}-${safeName}`);
        },
    }),
    limits: { fileSize: UPLOAD_CONFIG.maxFileSizeBytes },
    fileFilter: (_req, file, cb) => {
        if (isValidVideoFile(file.mimetype, file.originalname)) {
            cb(null, true);
        } else {
            console.error(`Rejected file: ${file.originalname} (mimetype: ${file.mimetype})`);
            cb(new Error(`Only video files are allowed. Received: ${file.mimetype}`));
        }
    },
});

async function ensureTempDir(): Promise<void> {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch { }
}

async function cleanupOldFiles(): Promise<void> {
    try {
        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();

        await Promise.all(files.map(async (file) => {
            const filePath = path.join(TEMP_DIR, file);
            try {
                const stats = await fs.stat(filePath);
                if (now - stats.mtimeMs > UPLOAD_CONFIG.fileMaxAgeMs) {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up: ${file}`);
                }
            } catch { }
        }));
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

async function safeUnlink(filePath: string): Promise<void> {
    try { await fs.unlink(filePath); } catch { }
}

function isPathSafe(filePath: string): boolean {
    return path.resolve(filePath).startsWith(path.resolve(TEMP_DIR));
}

function buildFFmpegArgs(inputPath: string, outputPath: string): string[] {
    return [
        '-i', inputPath,
        '-threads', String(FFMPEG_CONFIG.threads),
        '-c:v', 'libx264',
        '-preset', FFMPEG_CONFIG.preset,
        '-tune', FFMPEG_CONFIG.tune,
        '-crf', String(FFMPEG_CONFIG.crf),
        '-maxrate', FFMPEG_CONFIG.maxVideoBitrate,
        '-bufsize', FFMPEG_CONFIG.bufferSize,
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', FFMPEG_CONFIG.audioBitrate,
        '-ac', String(FFMPEG_CONFIG.audioChannels),
        '-movflags', '+faststart',
        '-y',
        outputPath,
    ];
}

function runFFmpegConversion(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', buildFFmpegArgs(inputPath, outputPath), {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stderr = '';
        ffmpeg.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

        const timeout = setTimeout(() => {
            ffmpeg.kill('SIGTERM');
            reject(new Error('FFmpeg timeout - video may be too large'));
        }, FFMPEG_CONFIG.timeoutMs);

        ffmpeg.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`FFmpeg exited with code ${code}\n${stderr.slice(-500)}`));
            }
        });

        ffmpeg.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

router.post('/convert', convertLimiter, upload.single('video'), async (req: Request, res: Response) => {
    await ensureTempDir();

    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    const inputPath = req.file.path;
    const baseName = path.parse(req.file.filename).name;
    const safeBaseName = sanitize(baseName) || 'output';
    const outputFilename = `${safeBaseName}.mp4`;
    const outputPath = path.join(TEMP_DIR, outputFilename);

    if (!isPathSafe(inputPath) || !isPathSafe(outputPath)) {
        return res.status(400).json({ error: 'Invalid file path' });
    }

    try {
        console.log(`Converting: ${req.file.originalname}`);
        await runFFmpegConversion(inputPath, outputPath);

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);

        const fileBuffer = await fs.readFile(outputPath);
        res.send(fileBuffer);

        await safeUnlink(inputPath);
        await safeUnlink(outputPath);
        console.log(`Conversion complete: ${outputFilename}`);
    } catch (error) {
        console.error('Conversion error:', error);
        await safeUnlink(inputPath);
        await safeUnlink(outputPath);

        return res.status(500).json({
            error: 'Video conversion failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'screenrec-api' });
});

setInterval(cleanupOldFiles, UPLOAD_CONFIG.cleanupIntervalMs);
cleanupOldFiles();

export { router as convertRouter };
