# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies with pnpm (lockfile optional for first boot)
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10.12.2 --activate
COPY package.json ./
# Copy lockfile when present; otherwise pnpm resolves from package.json
COPY pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false

FROM base AS runner
RUN apk add --no-cache wget \
  && addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/health || exit 1

CMD ["node", "src/server.js"]
