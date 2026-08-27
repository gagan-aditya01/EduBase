# Multi-stage Docker build for Node.js Express Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Expose backend port
EXPOSE 5050

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Start server
CMD ["node", "backend/src/server.js"]
