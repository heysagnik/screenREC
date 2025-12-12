import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

const execAsync = promisify(exec);
const router: RouterType = Router();

// Cross-platform temp directory
const TEMP_DIR = path.join(os.tmpdir(), 'screenrec');

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: TEMP_DIR,
        filename: (req, file, cb) => {
            const uniqueId = crypto.randomBytes(8).toString('hex');
            cb(null, `${uniqueId}-${file.originalname}`);
        },
    }),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max
    },
});

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (error) {
        // Directory may already exist
    }
}

// Clean up files older than 10 minutes
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

// Run cleanup every 5 minutes
setInterval(cleanupOldFiles, 5 * 60 * 1000);

// POST /api/convert - Convert video to MP4
router.post('/convert', upload.single('video'), async (req, res) => {
    await ensureTempDir();

    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    const inputPath = req.file.path;
    const outputFilename = `${path.parse(req.file.filename).name}.mp4`;
    const outputPath = path.join(TEMP_DIR, outputFilename);

    try {
        // Convert to MP4 using FFmpeg
        const ffmpegCommand = [
            'ffmpeg',
            '-i', inputPath,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            '-y', // Overwrite output
            outputPath,
        ].join(' ');

        console.log(`Converting: ${req.file.originalname}`);
        await execAsync(ffmpegCommand);

        // Send the converted file
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);

        const fileStream = await fs.readFile(outputPath);
        res.send(fileStream);

        // Clean up input file immediately, output after 10 min
        await fs.unlink(inputPath);
        console.log(`Conversion complete: ${outputFilename}`);

    } catch (error) {
        console.error('Conversion error:', error);

        // Clean up on error
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

// GET /api/health
router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'screenrec-api' });
});

export { router as convertRouter };
