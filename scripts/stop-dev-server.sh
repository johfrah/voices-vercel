#!/usr/bin/env bash
set -euo pipefail

pids="$(netstat -tlnp 2>/dev/null | awk '/:3000 / { split($7, parts, "/"); if (parts[1] ~ /^[0-9]+$/) print parts[1] }' | sort -u)"

if [ -z "${pids}" ]; then
  echo "No process found on port 3000."
  exit 0
fi

echo "Stopping process(es) on port 3000: ${pids}"
kill ${pids}
echo "Stopped."
