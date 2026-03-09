#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

echo "☁️ Voices Cloud setup: workspace bootstrap"
echo "📦 Installing npm workspaces from root package-lock.json..."

npm ci --include-workspace-root --workspaces --no-audit --fund=false

echo "🎭 Ensuring Playwright Chromium is available in cloud agents..."
if command -v apt-get >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
  echo "🔧 Installing Chromium + Linux dependencies via Playwright..."
  npx playwright install --with-deps chromium
else
  echo "🔧 Installing Chromium browser binary (without system deps escalation)..."
  npx playwright install chromium
fi

echo "🔍 Validating workspace lock consistency..."
node scripts/verify-workspace-lock.mjs

echo "✅ Cloud setup complete. Root + apps/web are lock-consistent."
