# Use an official Node.js runtime
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy configuration files
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY libs/common-types/tsconfig.json ./libs/common-types/
COPY services/property-ai/tsconfig.json ./services/property-ai/

# Copy source code
COPY libs ./libs
COPY services ./services

# Install dependencies. This will also link the local workspaces.
RUN npm install --omit=dev

# Build the entire monorepo. 
# tsc -b will follow the "references" in the tsconfig files.
RUN npm run build

# The start script in package.json points to the property-ai service
CMD ["npm", "start"]
