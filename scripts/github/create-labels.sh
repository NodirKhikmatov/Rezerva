#!/usr/bin/env bash
# Creates GitHub labels for the Rezerva project.
# Requires: gh CLI authenticated (gh auth login)
set -euo pipefail

REPO="${1:-}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is not installed. See https://cli.github.com/"
  exit 1
fi

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  if [[ -n "$REPO" ]]; then
    gh label create "$name" --color "$color" --description "$description" --repo "$REPO" --force
  else
    gh label create "$name" --color "$color" --description "$description" --force
  fi
}

echo "Creating milestone labels..."
for i in 0 1 2 3 4 5 6 7 8 9 10 11; do
  create_label "milestone/M$i" "0E8A16" "Roadmap milestone M$i"
done

echo "Creating type labels..."
create_label "type/epic" "5319E7" "Epic spanning multiple tasks"
create_label "type/feature" "1D76DB" "User-facing feature"
create_label "type/chore" "FBCA04" "Maintenance or tooling"
create_label "type/infra" "006B75" "Infrastructure and DevOps"
create_label "type/bug" "D73A4A" "Defect fix"

echo "Creating area labels..."
create_label "area/backend" "C5DEF5" "NestJS API and workers"
create_label "area/frontend" "BFD4F2" "Next.js applications"
create_label "area/database" "D4C5F9" "PostgreSQL and Prisma"
create_label "area/devops" "006B75" "CI/CD, Docker, hosting"
create_label "area/telegram" "E99695" "Telegram bot and Mini App"
create_label "area/payment" "F9D0C4" "Payme, Click, refunds"
create_label "area/design" "FEF2C0" "Design system and UX"

echo "Creating priority labels..."
create_label "priority/P0" "B60205" "Critical — blocks milestone"
create_label "priority/P1" "D93F0B" "High — required for milestone"
create_label "priority/P2" "FBCA04" "Medium — should have"

echo "Creating story point labels..."
for pts in 1 2 3 5 8 13 21; do
  create_label "points/$pts" "EDEDED" "Story points: $pts"
done

echo "Done."
