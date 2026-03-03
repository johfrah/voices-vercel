#!/bin/bash

# VOICES VERCEL IGNORE BUILD SCRIPT (2026)
# Dit script bepaalt of een build moet doorgaan op basis van de branch en wijzigingen.

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

# 1. Altijd builden op main (Productie)
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  echo "✅ Build proceed: Main branch detected."
  exit 1
fi

# 2. Altijd builden op staging
if [[ "$VERCEL_GIT_COMMIT_REF" == "staging" ]]; then
  echo "✅ Build proceed: Staging branch detected."
  exit 1
fi

# 3. Voor andere branches: check of er relevante wijzigingen zijn in de web app
# We gebruiken git diff om te zien of er iets is veranderd in de relevante mappen.
# Als er GEEN wijzigingen zijn in apps/web of packages/database, skippen we de build.

git diff HEAD^ HEAD --quiet apps/web/ packages/database/ scripts/ docs/

if [ $? -eq 0 ]; then
  echo "🛑 Build ignored: No changes detected in relevant directories."
  exit 0
else
  echo "✅ Build proceed: Changes detected in relevant directories."
  exit 1
fi
