# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# 전체 의존성 설치 (빌드 시 필요)
# --no-audit, --no-fund로 불필요한 네트워크 요청 제거
RUN npm ci --no-audit --no-fund

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# 헬스체크용 wget만 설치 (최소한의 패키지)
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Handle public directory
RUN mkdir -p ./public /tmp/builder-public
RUN --mount=from=builder,source=/app,target=/mnt/app,rw \
    if [ -d "/mnt/app/public" ] && [ "$(ls -A /mnt/app/public 2>/dev/null)" ]; then \
        cp -r /mnt/app/public/* ./public/; \
    fi

# Copy Prisma files and CLI
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
# Node.js 힙 메모리 300MB로 제한 (t3.micro 1GB RAM에 맞춤)
ENV NODE_OPTIONS="--max-old-space-size=300"

CMD ["/app/entrypoint.sh"]