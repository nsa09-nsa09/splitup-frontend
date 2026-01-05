# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - just keep the built files
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Keep container running (nginx on host will serve files)
CMD ["tail", "-f", "/dev/null"]
