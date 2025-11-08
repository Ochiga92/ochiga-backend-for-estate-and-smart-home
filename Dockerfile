# -------------------------------
# 🏗️  STAGE 1 — Build Stage
# -------------------------------
FROM node:20-bullseye AS builder

# Install dependencies required for native builds (e.g., better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install all dependencies (including dev for Nest build)
RUN npm install --legacy-peer-deps

# Copy full source
COPY . .

# Copy certs explicitly to avoid .dockerignore exclusion
COPY certs ./certs

# Build NestJS project
RUN npm run build

# -------------------------------
# 🚀  STAGE 2 — Runtime Stage
# -------------------------------
FROM node:20-bullseye AS runner

WORKDIR /app

# Copy only necessary runtime files
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled output and certs from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/certs ./certs

# Expose backend port
EXPOSE 4000

# ✅ Environment variables (override in docker-compose or .env)
ENV NODE_ENV=production
ENV PORT=4000
ENV AWS_IOT_ENDPOINT=a3m9h28ikfvc7r-ats.iot.us-east-1.amazonaws.com
ENV AWS_IOT_PRIVATE_KEY_PATH=certs/private.pem.key
ENV AWS_IOT_CERT_PATH=certs/certificate.pem.crt
ENV AWS_IOT_ROOT_CA_PATH=certs/AmazonRootCA1.pem

# Default start command
CMD ["npm", "run", "start:prod"]
