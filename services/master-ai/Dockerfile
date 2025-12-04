# ------------ BUILD STAGE ------------
FROM node:18 AS builder

# WORKDIR must point at the repo root so builds include shared libs.
WORKDIR /app

# Copy the entire repo into the build container.
COPY . .

# Install dependencies for the whole monorepo and build.
RUN npm install
RUN npm run build


# ------------ RUNTIME STAGE ----------
FROM node:18

WORKDIR /app

# Copy only the compiled output for the Master AI service and shared libs.
COPY --from=builder /app/dist/libs ./dist/libs
COPY --from=builder /app/dist/services/master-ai ./dist/services/master-ai
COPY --from=builder /app/policy ./policy
COPY --from=builder /app/services/master-ai/start.sh ./start.sh

# Copy package metadata and install production deps.
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Ensure the runtime can resolve path aliases for shared libs.
RUN mkdir -p node_modules/@app \
    && cp -R dist/libs/* node_modules/@app/

ARG OPA_VERSION=1.8.0
# Install OPA so the policy server can run locally.
RUN curl -fsSL "https://openpolicyagent.org/downloads/v${OPA_VERSION}/opa_linux_amd64" -o /usr/local/bin/opa \
    && chmod +x /usr/local/bin/opa

RUN chmod +x start.sh

ENV PORT=8080
EXPOSE 8080

CMD ["./start.sh"]
