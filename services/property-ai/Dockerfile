# ----------- BUILD STAGE -----------
FROM node:18 AS builder

WORKDIR /app

# Copy the entire monorepo (IMPORTANT)
COPY . .

# Install all deps including devDependencies (tsc-alias)
RUN npm install

# Build using YOUR build script (tsc -b && tsc-alias)
RUN npm run build



# ----------- RUNTIME STAGE -----------
FROM node:18

WORKDIR /app

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy only production deps
COPY package.json package-lock.json ./

RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "dist/main.js"]
