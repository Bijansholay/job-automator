# Use official Playwright base image matching locked npm version (1.62.1)
FROM mcr.microsoft.com/playwright:v1.62.1-jammy

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build frontend production bundle (Vite)
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV HEADLESS=true
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose HTTP port
EXPOSE 5001

# Start production server
CMD ["node", "server/server.js"]
