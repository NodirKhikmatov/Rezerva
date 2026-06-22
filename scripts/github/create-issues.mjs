#!/usr/bin/env node
/**
 * Bulk-create GitHub issues from roadmap definitions.
 * Usage: node scripts/github/create-issues.mjs [--dry-run] [--milestone M0]
 * Requires: gh CLI (gh auth login)
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const milestoneFilter = process.argv
  .find((a) => a.startsWith('--milestone='))
  ?.split('=')[1];

function ghAvailable() {
  return spawnSync('gh', ['--version'], { stdio: 'ignore' }).status === 0;
}

function formatBody(issue) {
  const ac = issue.acceptanceCriteria.map((item) => `- [ ] ${item}`).join('\n');
  const checklist = issue.checklist.map((item) => `- [ ] ${item}`).join('\n');

  return `## Description

${issue.description}

## Story Points

**${issue.storyPoints}**

## Priority

**${issue.priority}**

## Acceptance Criteria

${ac}

## Checklist

${checklist}
`;
}

function createIssue(issue) {
  const labels = [
    issue.milestone,
    issue.type,
    issue.area,
    issue.priority,
    `points/${issue.storyPoints}`,
    ...issue.extraLabels,
  ].filter(Boolean);

  const body = formatBody(issue);

  if (dryRun) {
    console.log(`\n--- DRY RUN: ${issue.title} ---`);
    console.log(`Labels: ${labels.join(', ')}`);
    console.log(body.slice(0, 200) + '...');
    return;
  }

  const args = [
    'issue',
    'create',
    '--title',
    issue.title,
    '--body',
    body,
    ...labels.flatMap((l) => ['--label', l]),
  ];

  const result = spawnSync('gh', args, { stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Failed to create issue: ${issue.title}`);
  }
}

function main() {
  const issuesPath = join(__dirname, '../../.github/issues/issues.json');
  const { issues } = JSON.parse(readFileSync(issuesPath, 'utf8'));
  const filtered = milestoneFilter
    ? issues.filter((i) => i.milestone === `milestone/${milestoneFilter}`)
    : issues;

  if (!dryRun && !ghAvailable()) {
    console.error('Error: GitHub CLI (gh) is not installed.');
    console.error('Install: https://cli.github.com/');
    console.error('Then run: gh auth login');
    process.exit(1);
  }

  console.log(
    `Creating ${filtered.length} issues${dryRun ? ' (dry run)' : ''}...`,
  );

  for (const issue of filtered) {
    createIssue(issue);
  }

  console.log(`\nDone. ${filtered.length} issues processed.`);
}

main();
