#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

echo "☁️ Voices Cloud setup: workspace bootstrap"
echo "📦 Installing npm workspaces from root package-lock.json..."

npm ci --include-workspace-root --workspaces --no-audit --fund=false

echo "🎭 Ensuring Playwright Chromium is available in cloud agents..."
npx playwright install chromium

echo "🔍 Validating workspace lock consistency..."
node scripts/verify-workspace-lock.mjs

echo "✅ Cloud setup complete. Root + apps/web are lock-consistent."
