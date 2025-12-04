# ------------ BUILD STAGE ------------
FROM node:18 AS builder

# WORKDIR must be the repo root, NOT inside the service
WORKDIR /app

# Copy entire monorepo from the build context
COPY . .

# Install dependencies for whole monorepo
RUN npm install

# Build the entire monorepo (libs + property-ai)
RUN npm run build



# ------------ RUNTIME STAGE ----------
FROM node:18

WORKDIR /app

# Copy ONLY the built output needed for this service
COPY --from=builder /app/dist/libs ./dist/libs
COPY --from=builder /app/dist/services/property-ai ./dist/services/property-ai

# Copy package.json files
COPY package.json package-lock.json ./

# Install only prod dependencies
RUN npm install --omit=dev

RUN mkdir -p node_modules/@app \
    && cp -R dist/libs/common-types node_modules/@app/common-types

ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/services/property-ai/main.js"]
