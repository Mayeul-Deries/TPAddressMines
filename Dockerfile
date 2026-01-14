FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy static assets required at runtime (OpenAPI spec, etc.)
COPY --from=builder /app/openapi.yaml ./openapi.yaml
COPY --from=builder /app/jest.config.ts ./jest.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["node", "dist/server.js"]
