# ────────────────────────────────────────────────────────────
# Stage 1: Build Phase
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

# Prune devDependencies
RUN npm prune --production

# ────────────────────────────────────────────────────────────
# Stage 2: Production Runner
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install security updates
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create uploads and logs directories
RUN mkdir -p uploads logs && \
    chown -R node:node /usr/src/app

# Run as non-privileged node user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
