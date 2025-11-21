# Use an official Node.js runtime
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy all configuration and package files first
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY libs/common-types/tsconfig.json ./libs/common-types/
COPY services/property-ai/tsconfig.json ./services/property-ai/

# Copy all source code for the monorepo
COPY libs ./libs
COPY services ./services

# Install production dependencies. This will also link the local workspaces.
RUN npm install --omit=dev

# Build the entire monorepo. 
# tsc -b will follow the "references" in the corrected tsconfig.json.
RUN npm run build

# The start script in package.json points to the property-ai service
# and uses tsconfig-paths with the correct base URL.
CMD ["npm", "start"]