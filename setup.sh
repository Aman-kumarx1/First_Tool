#!/bin/bash

# Setup script for WhatsApp Backup Tool
# Installs required system dependencies for Puppeteer/Chromium

echo "🔧 Installing system dependencies for WhatsApp Backup Tool..."
echo "This may take a few minutes..."

# Update package lists
sudo apt-get update -qq

# Install required packages
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libcups2 \
  libgconf-2-4 \
  libgbm1 \
  libgtk-3-0 \
  libnotify4 \
  libnss3 \
  libsecret-1-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  xdg-utils \
  libatk-1.0-0 \
  libatk-bridge2.0-0 2>&1 | grep -v "Reading\|Building\|Setting"

echo ""
echo "✅ System dependencies installed successfully!"
echo ""
echo "📦 Installing npm packages..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the backup tool, run:"
echo "   npm start"
echo ""
