/**
 * Background Renderer Worker
 * Renders video frames using OffscreenCanvas - not throttled when tab is hidden
 */

interface RenderConfig {
    width: number;
    height: number;
    fps: number;
    layout: 'pip' | 'circle' | 'side-by-side';
    cameraPosition: { x: number; y: number };
    cameraSize: { width: number; height: number };
}

interface FrameData {
    screenBitmap?: ImageBitmap;
    cameraBitmap?: ImageBitmap;
    timestamp: number;
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let config: RenderConfig | null = null;
let renderInterval: number | null = null;
let latestScreenBitmap: ImageBitmap | null = null;
let latestCameraBitmap: ImageBitmap | null = null;

function initCanvas(width: number, height: number): void {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D;
    if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
}

function resizeCanvas(width: number, height: number): void {
    if (!canvas) return;
    const evenW = Math.floor(width) & ~1;
    const evenH = Math.floor(height) & ~1;
    canvas.width = Math.max(2, evenW);
    canvas.height = Math.max(2, evenH);
}

function fitContain(srcW: number, srcH: number, dstW: number, dstH: number) {
    const srcAspect = srcW / srcH;
    const dstAspect = dstW / dstH;
    let w = dstW, h = dstH;
    if (srcAspect > dstAspect) {
        h = Math.round(dstW / srcAspect);
    } else {
        w = Math.round(dstH * srcAspect);
    }
    return { x: Math.floor((dstW - w) / 2), y: Math.floor((dstH - h) / 2), w, h };
}

function drawCircularCamera(cameraBitmap: ImageBitmap): void {
    if (!ctx || !canvas || !config) return;

    const { cameraPosition, cameraSize } = config;
    const radius = cameraSize.width / 2;
    const centerX = cameraPosition.x + radius;
    const centerY = cameraPosition.y + radius;
    const srcSize = Math.min(cameraBitmap.width, cameraBitmap.height);
    const sx = (cameraBitmap.width - srcSize) / 2;
    const sy = (cameraBitmap.height - srcSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.translate(centerX + radius, centerY - radius);
    ctx.scale(-1, 1);
    ctx.drawImage(cameraBitmap, sx, sy, srcSize, srcSize, 0, 0, cameraSize.width, cameraSize.width);
    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawRectangularCamera(cameraBitmap: ImageBitmap): void {
    if (!ctx || !canvas || !config) return;

    const { cameraPosition, cameraSize } = config;
    const r = 12;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cameraPosition.x + r, cameraPosition.y);
    ctx.lineTo(cameraPosition.x + cameraSize.width - r, cameraPosition.y);
    ctx.quadraticCurveTo(cameraPosition.x + cameraSize.width, cameraPosition.y,
        cameraPosition.x + cameraSize.width, cameraPosition.y + r);
    ctx.lineTo(cameraPosition.x + cameraSize.width, cameraPosition.y + cameraSize.height - r);
    ctx.quadraticCurveTo(cameraPosition.x + cameraSize.width, cameraPosition.y + cameraSize.height,
        cameraPosition.x + cameraSize.width - r, cameraPosition.y + cameraSize.height);
    ctx.lineTo(cameraPosition.x + r, cameraPosition.y + cameraSize.height);
    ctx.quadraticCurveTo(cameraPosition.x, cameraPosition.y + cameraSize.height,
        cameraPosition.x, cameraPosition.y + cameraSize.height - r);
    ctx.lineTo(cameraPosition.x, cameraPosition.y + r);
    ctx.quadraticCurveTo(cameraPosition.x, cameraPosition.y, cameraPosition.x + r, cameraPosition.y);
    ctx.closePath();
    ctx.clip();

    ctx.translate(cameraPosition.x + cameraSize.width, cameraPosition.y);
    ctx.scale(-1, 1);
    ctx.drawImage(cameraBitmap, 0, 0, cameraBitmap.width, cameraBitmap.height,
        0, 0, cameraSize.width, cameraSize.height);
    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cameraPosition.x + r, cameraPosition.y);
    ctx.lineTo(cameraPosition.x + cameraSize.width - r, cameraPosition.y);
    ctx.quadraticCurveTo(cameraPosition.x + cameraSize.width, cameraPosition.y,
        cameraPosition.x + cameraSize.width, cameraPosition.y + r);
    ctx.lineTo(cameraPosition.x + cameraSize.width, cameraPosition.y + cameraSize.height - r);
    ctx.quadraticCurveTo(cameraPosition.x + cameraSize.width, cameraPosition.y + cameraSize.height,
        cameraPosition.x + cameraSize.width - r, cameraPosition.y + cameraSize.height);
    ctx.lineTo(cameraPosition.x + r, cameraPosition.y + cameraSize.height);
    ctx.quadraticCurveTo(cameraPosition.x, cameraPosition.y + cameraSize.height,
        cameraPosition.x, cameraPosition.y + cameraSize.height - r);
    ctx.lineTo(cameraPosition.x, cameraPosition.y + r);
    ctx.quadraticCurveTo(cameraPosition.x, cameraPosition.y, cameraPosition.x + r, cameraPosition.y);
    ctx.closePath();
    ctx.stroke();
}

function render(): void {
    if (!ctx || !canvas || !config) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (latestScreenBitmap) {
        const { x, y, w, h } = fitContain(latestScreenBitmap.width, latestScreenBitmap.height, canvas.width, canvas.height);
        ctx.drawImage(latestScreenBitmap, 0, 0, latestScreenBitmap.width, latestScreenBitmap.height, x, y, w, h);
    }

    if (latestCameraBitmap && latestScreenBitmap) {
        config.layout === 'circle' ? drawCircularCamera(latestCameraBitmap) : drawRectangularCamera(latestCameraBitmap);
    } else if (latestCameraBitmap && !latestScreenBitmap) {
        const { x, y, w, h } = fitContain(latestCameraBitmap.width, latestCameraBitmap.height, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(latestCameraBitmap, 0, 0, latestCameraBitmap.width, latestCameraBitmap.height, 0, 0, w, h);
        ctx.restore();
    }

    self.postMessage({ type: 'frameRendered', timestamp: performance.now() });
}

function startRenderLoop(fps: number): void {
    stopRenderLoop();
    renderInterval = self.setInterval(render, 1000 / fps);
}

function stopRenderLoop(): void {
    if (renderInterval !== null) {
        self.clearInterval(renderInterval);
        renderInterval = null;
    }
}

self.onmessage = async (e: MessageEvent) => {
    const { type, data } = e.data;

    switch (type) {
        case 'init':
            config = data.config as RenderConfig;
            initCanvas(config.width, config.height);
            startRenderLoop(config.fps);
            self.postMessage({ type: 'initialized' });
            break;

        case 'updateConfig':
            if (config) {
                Object.assign(config, data.config);
                if (data.config.width || data.config.height) resizeCanvas(config.width, config.height);
                if (data.config.fps) startRenderLoop(config.fps);
            }
            break;

        case 'frame':
            const frameData = data as FrameData;
            if (frameData.screenBitmap) {
                latestScreenBitmap?.close();
                latestScreenBitmap = frameData.screenBitmap;
            }
            if (frameData.cameraBitmap) {
                latestCameraBitmap?.close();
                latestCameraBitmap = frameData.cameraBitmap;
            }
            break;

        case 'stop':
            stopRenderLoop();
            latestScreenBitmap?.close();
            latestCameraBitmap?.close();
            latestScreenBitmap = null;
            latestCameraBitmap = null;
            canvas = null;
            ctx = null;
            self.postMessage({ type: 'stopped' });
            break;

        case 'getCanvas':
            if (canvas) {
                self.postMessage({ type: 'canvas', canvas }, { transfer: [canvas] });
            }
            break;
    }
};

self.postMessage({ type: 'ready' });
