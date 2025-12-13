# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# 전체 의존성 설치 (빌드 시 필요)
# --no-audit, --no-fund로 불필요한 네트워크 요청 제거
# --legacy-peer-deps: Next.js 16과 next-auth@4 호환성 문제 우회
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
# Provide dummy env vars for build-time (Next.js needs these during static analysis)
RUN SKIP_ENV_VALIDATION=true \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    NEXTAUTH_URL="http://localhost:3000" \
    NEXTAUTH_SECRET="dummy-secret-min-32-chars-long-12345" \
    JWT_SECRET="dummy-jwt-secret-min-32-chars-long" \
    SESSION_SECRET="dummy-session-secret-min-32-chars" \
    CSRF_SECRET="dummy-csrf-secret-min-32-chars-lo" \
    GOOGLE_CLIENT_ID="dummy" \
    GOOGLE_CLIENT_SECRET="dummy" \
    GITHUB_CLIENT_ID="dummy" \
    GITHUB_CLIENT_SECRET="dummy" \
    OPENAI_API_KEY="sk-dummy-key-for-build-only" \
    RESEND_API_KEY="re_dummy" \
    NODE_ENV="production" \
    npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache wget postgresql-client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (minimal dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public directory if exists
RUN --mount=from=builder,source=/app,target=/mnt/app \
    if [ -d "/mnt/app/public" ]; then \
        cp -r /mnt/app/public ./public && chown -R nextjs:nodejs ./public; \
    fi

# Copy Prisma schema for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy original package.json to read Prisma version
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json.original

# Install ONLY Prisma CLI for migrations (not entire node_modules)
# This is much smaller than copying all node_modules (~5MB vs ~200MB)
# IMPORTANT: Automatically match package.json prisma version (strips ^ or ~)
RUN PRISMA_VERSION=$(grep '"prisma"' ./package.json.original | head -1 | sed 's/.*"\^*\([0-9.]*\)".*/\1/') && \
    echo "Installing Prisma CLI version: ${PRISMA_VERSION}" && \
    npm install --global prisma@${PRISMA_VERSION} --no-audit --no-fund

# Copy entrypoint scripts
COPY --chown=nextjs:nodejs entrypoint.sh /app/entrypoint.sh
COPY --chown=nextjs:nodejs entrypoint-baseline.sh /app/entrypoint-baseline.sh
RUN chmod +x /app/entrypoint.sh /app/entrypoint-baseline.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Node.js 힙 메모리 300MB로 제한 (t3.micro 1GB RAM에 맞춤)
ENV NODE_OPTIONS="--max-old-space-size=300"

CMD ["/app/entrypoint.sh"]
