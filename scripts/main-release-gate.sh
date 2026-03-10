#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

echo "🚦 Main release gate: verify workspace lock"
npm run verify:workspace-lock

echo "🚦 Main release gate: type-check"
npm run type-check

echo "🚦 Main release gate: lint"
npm run lint

echo "🚦 Main release gate: pre-vercel"
npm run check:pre-vercel

echo "🚦 Main release gate: console audit (${CONSOLE_AUDIT_SCOPE:-critical})"
npm run audit:console

echo "✅ Main release gate passed."
