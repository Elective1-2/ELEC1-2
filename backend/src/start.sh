#!/bin/bash
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..
echo "🚀 Starting server..."
node server.js