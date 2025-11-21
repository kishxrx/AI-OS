# -------------------------------------------------------
# 1. Builder Stage
# -------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY libs ./libs
COPY services ./services

RUN npm install

RUN npm run build


# -------------------------------------------------------
# 2. Runtime Stage
# -------------------------------------------------------
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

ENV PORT=8080

CMD ["node", "dist/services/property-ai/main.js"]