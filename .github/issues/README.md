# GitHub Issues — Rezerva Roadmap

This folder contains **68 issues** mapped to milestones **M0–M11** from the development roadmap.

Each issue includes:

- Description
- Acceptance Criteria
- Checklist
- Labels (milestone, type, area, priority, story points)

## Prerequisites

1. Initialize git and push to GitHub:

   ```bash
   git init
   gh repo create rezerva --private --source=. --push
   ```

2. Install GitHub CLI: https://cli.github.com/
   ```bash
   gh auth login
   ```

## Create labels

```bash
chmod +x scripts/github/create-labels.sh
./scripts/github/create-labels.sh
# Or for a specific repo:
./scripts/github/create-labels.sh owner/repo
```

## Create all issues

```bash
# Dry run (preview only)
node scripts/github/create-issues.mjs --dry-run

# Create all 68 issues
node scripts/github/create-issues.mjs

# Create one milestone only
node scripts/github/create-issues.mjs --milestone=M0
```

## Issue summary

| Milestone | Issues | Story Points (sum) |
| --------- | ------ | ------------------ |
| M0        | 12     | ~66                |
| M1        | 8      | ~71                |
| M2        | 8      | ~104               |
| M3        | 7      | ~55                |
| M4        | 5      | ~58                |
| M5        | 5      | ~39                |
| M6        | 5      | ~58                |
| M7        | 3      | ~29                |
| M8        | 4      | ~42                |
| M9        | 3      | ~42                |
| M10       | 4      | ~47                |
| M11       | 4      | ~58                |

## Labels reference

| Label                | Purpose             |
| -------------------- | ------------------- |
| `milestone/M0`–`M11` | Roadmap phase       |
| `type/epic`          | Milestone umbrella  |
| `type/feature`       | Deliverable feature |
| `type/chore`         | Tooling, refactor   |
| `type/infra`         | DevOps, Docker, CI  |
| `area/backend`       | NestJS API          |
| `area/frontend`      | Next.js             |
| `area/database`      | Prisma, PostgreSQL  |
| `area/devops`        | CI/CD, hosting      |
| `area/telegram`      | Bot, Mini App       |
| `area/payment`       | Payme, Click        |
| `area/design`        | Design system       |
| `priority/P0`        | Critical            |
| `priority/P1`        | High                |
| `priority/P2`        | Medium              |
| `points/1`–`21`      | Story points        |

## GitHub Projects

After creating issues, add them to a GitHub Project board:

1. Create project "Rezerva Roadmap"
2. Group by `milestone/*` label
3. Filter epics with `type/epic`
4. Sum story points using `points/*` labels
