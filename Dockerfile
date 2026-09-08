# Use lightweight Node 20 slim image (~180MB)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install lightweight system Chromium binary & dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Instruct Playwright to use system-installed Chromium executable
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy application source code
COPY . .

# Build frontend production bundle (Vite)
RUN npm run build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5001
ENV HEADLESS=true
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose HTTP port
EXPOSE 5001

# Start production server
CMD ["node", "server/server.js"]
