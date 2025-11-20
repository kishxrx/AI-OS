# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for the root and property-ai service
# This allows npm to cache dependencies efficiently
COPY package.json ./
COPY package-lock.json ./
COPY libs/common-types/package.json ./libs/common-types/
COPY services/property-ai/package.json ./services/property-ai/

# Install root dependencies and then common-types and property-ai dependencies
RUN npm install --omit=dev && \
    npm install --prefix libs/common-types --omit=dev && \
    npm install --prefix services/property-ai --omit=dev

# Copy the rest of the application code
COPY . .

# Build the TypeScript project
# The -b flag ensures all referenced projects (like common-types) are built
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# Use the production build output
CMD [ "node", "dist/services/property-ai/main.js" ]

