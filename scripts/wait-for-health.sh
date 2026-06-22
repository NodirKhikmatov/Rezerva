#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${1:-http://localhost:3001/health}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

echo "Waiting for healthy API at ${HEALTH_URL}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  response="$(curl -sf "$HEALTH_URL" || true)"

  if echo "$response" | grep -q '"status":"ok"'; then
    echo "Health check passed on attempt ${attempt}"
    exit 0
  fi

  echo "Attempt ${attempt}/${MAX_ATTEMPTS} — not ready yet"
  sleep "$SLEEP_SECONDS"
done

echo "Health check failed after ${MAX_ATTEMPTS} attempts" >&2
exit 1
