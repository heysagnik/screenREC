# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY turbo.json ./

# Build
RUN pnpm build:api

# Production stage
FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Install pnpm for production install
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy workspace config (needed for workspace: protocol)
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy packages/shared (needed as dependency)
COPY --from=builder /app/packages/shared ./packages/shared

# Copy apps/api with built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Create production lockfile and install
WORKDIR /app/apps/api
RUN pnpm install --prod --ignore-workspace

# Create temp directory
RUN mkdir -p /tmp/screenrec

EXPOSE 3001

CMD ["node", "dist/index.js"]
