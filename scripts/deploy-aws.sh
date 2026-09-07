#!/usr/bin/env bash
set -e

echo "================================================="
echo "🚀 Starting JobCraft AI Deployment on AWS"
echo "================================================="

# Target deployment directory
APP_DIR="/var/www/job-automator"

# Ensure Git is installed
if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  sudo apt-get update && sudo apt-get install -y git || sudo yum install -y git
fi

# Ensure Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER || true
  rm -f get-docker.sh
fi

# Ensure Docker Compose plugin is installed
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo apt-get update && sudo apt-get install -y docker-compose-plugin || true
fi

# Clone or pull repository
if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository to $APP_DIR..."
  sudo mkdir -p "$APP_DIR"
  sudo chown -R $USER:$USER "$APP_DIR"
  git clone https://github.com/Bijansholay/job-automator.git "$APP_DIR"
  cd "$APP_DIR"
else
  echo "Pulling latest code from GitHub..."
  cd "$APP_DIR"
  git fetch --all
  git reset --hard origin/main
fi

# Build and start container
echo "Building and launching Docker containers..."
if command -v docker-compose &> /dev/null; then
  sudo docker-compose up -d --build
else
  sudo docker compose up -d --build
fi

echo "================================================="
echo "✅ JobCraft AI successfully deployed on AWS!"
echo "Check health: http://localhost:5001/health"
echo "================================================="
