#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTPUT_DIR="${OUTPUT_DIR:-./backups}"
mkdir -p "$OUTPUT_DIR"

OUTPUT_FILE="${OUTPUT_DIR}/rezerva_${TIMESTAMP}.dump"

echo "Creating backup: ${OUTPUT_FILE}"
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$OUTPUT_FILE"

echo "Backup complete ($(du -h "$OUTPUT_FILE" | cut -f1))"
