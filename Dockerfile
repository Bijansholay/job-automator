# Use official Playwright Node base image (pre-bundled with Linux browser dependencies)
FROM mcr.microsoft.com/playwright/node:v1.42.1-focal

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install Playwright Chromium browser binary
RUN npx playwright install chromium

# Copy application source code
COPY . .

# Build frontend production bundle (Vite)
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV HEADLESS=true

# Expose HTTP port
EXPOSE 5001

# Start production server
CMD ["node", "server/server.js"]
