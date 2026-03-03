#!/bin/bash
echo "🚀 STARTING VOICES DEV RECOVERY..."

# 1. Increase file limits
ulimit -n 10000
echo "📈 Increased file limits to 10000"

# 2. Kill processes on port 3000 one by one
PIDS=$(lsof -t -i:3000)
if [ ! -z "$PIDS" ]; then
  for PID in $PIDS; do
    echo "💀 Attempting to kill PID: $PID..."
    kill -9 $PID 2>/dev/null || echo "⚠️ Could not kill $PID (maybe already dead or no permission)"
  done
fi

# 3. Clean Webpack cache
echo "🧹 Cleaning Webpack cache..."
rm -rf apps/web/.next/cache/webpack

# 4. Start Dev Server
echo "⚡ Starting Dev Server..."
cd apps/web && npm run dev
