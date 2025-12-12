# Build stage - uses pnpm workspace for building
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy ALL workspace files needed for build
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY turbo.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Install ALL dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Build the API
RUN pnpm build:api

# =============================================
# Production stage - COMPLETELY STANDALONE
# No pnpm, no workspace, just node and the built files
# =============================================
FROM node:20-alpine AS production

# Install FFmpeg for video conversion
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy only the compiled JavaScript
COPY --from=builder /app/apps/api/dist ./dist

# Install ONLY runtime dependencies directly with npm
# This avoids all pnpm workspace issues
RUN npm init -y && \
    npm install --save \
    cors@^2.8.5 \
    express@^4.21.2 \
    express-rate-limit@^8.2.1 \
    multer@^1.4.5-lts.1 \
    sanitize-filename@^1.6.3

# Create temp directory for video processing
RUN mkdir -p /tmp/screenrec

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
