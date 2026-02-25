#!/bin/bash

# Voiceglot v2.14.413 - Quick Verification Script
# This script helps verify the API is working correctly

echo "🔍 Voiceglot v2.14.413 Verification"
echo "===================================="
echo ""

# Check if we can reach the site
echo "1. Testing site connectivity..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.voices.be/admin/voiceglot/)
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 308 ]; then
    echo "   ✅ Site is reachable (HTTP $STATUS)"
else
    echo "   ❌ Site returned HTTP $STATUS"
fi
echo ""

# Check API endpoints (requires authentication, so this will likely fail)
echo "2. Testing API endpoints (may require auth)..."
echo "   Testing /api/admin/voiceglot/stats..."
curl -s -o /tmp/voiceglot-stats.json -w "HTTP %{http_code}\n" https://www.voices.be/api/admin/voiceglot/stats
echo ""

echo "   Testing /api/admin/voiceglot/list..."
curl -s -o /tmp/voiceglot-list.json -w "HTTP %{http_code}\n" https://www.voices.be/api/admin/voiceglot/list?page=1&limit=10
echo ""

echo "3. Checking local version..."
VERSION=$(grep '"version"' /Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/apps/web/package.json | head -1 | cut -d'"' -f4)
echo "   Local version: $VERSION"
echo ""

echo "===================================="
echo "📝 Manual Browser Verification Required"
echo "===================================="
echo ""
echo "Please open your browser and verify:"
echo "1. Navigate to: https://www.voices.be/admin/voiceglot/"
echo "2. Open Console (F12)"
echo "3. Look for: 🚀 [Voices] Nuclear Version: v2.14.413"
echo "4. Check table has data (not 'Missing')"
echo "5. Look for first translation key (e.g., 'nav.main_nav.0.label')"
echo ""
echo "Expected console logs:"
echo "  - 📡 [Voiceglot Page] Fetching stats..."
echo "  - 📊 [Voiceglot Page] Stats Received: {...}"
echo "  - 📋 [Voiceglot Page] List Received (Page 1): {...}"
echo "  - 📦 [Voiceglot Page] Grouped List for Rendering: [...]"
echo ""
