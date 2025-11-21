# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy package.json for libs and services to help with caching if they have their own dependencies
# In your case, they are empty, but it's a good practice for monorepos.
COPY libs/common-types/package.json ./libs/common-types/

# Install all dependencies from the root
RUN npm install --omit=dev

# Copy the rest of the source code
# This will include all services and libs
COPY . .

# Build the entire project, including all dependencies
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/tsconfig.json ./

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]