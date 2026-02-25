#!/bin/bash

# Voices Nuclear Push & Verify Script (2026)
# Author: Chris (Technical Director)

echo "🚀 Starting Nuclear Push..."

# 1. Push to GitHub
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Git push failed. Please check your connection or authentication."
    exit 1
fi

echo "✅ Push successful. Waiting for Vercel to pick up the build (10s)..."
sleep 10

# 2. Verify with GitHub CLI (gh)
GH_PATH="/opt/homebrew/bin/gh"
if [ ! -f "$GH_PATH" ]; then
    GH_PATH="gh"
fi

COMMIT_HASH=$(git rev-parse HEAD)

echo "🔍 Monitoring deployment for commit ${COMMIT_HASH:0:7}..."

# Polling loop
MAX_ATTEMPTS=60 # 5 minutes max
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    # Get status via gh api
    STATUS_JSON=$($GH_PATH api repos/:owner/:repo/commits/$COMMIT_HASH/status 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Could not fetch status via 'gh'. Are you logged in? (gh auth login)"
        echo "🌐 Check manually: https://vercel.com/johfrah/voices-vercel/deployments"
        exit 0
    fi

    STATE=$(echo $STATUS_JSON | grep -o '"state": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    case $STATE in
        "success")
            echo "✅ DEPLOYMENT SUCCESSFUL! Voices is live and healthy."
            exit 0
            ;;
        "failure"|"error")
            echo "❌ DEPLOYMENT FAILED! Check Vercel logs immediately."
            exit 1
            ;;
        "pending")
            echo "⏳ Build in progress... (Attempt $ATTEMPT/$MAX_ATTEMPTS)"
            ;;
        *)
            echo "❓ Unknown state: $STATE. Waiting..."
            ;;
    esac

    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

echo "⏰ Timeout: Deployment is taking longer than expected. Please check Vercel dashboard."
