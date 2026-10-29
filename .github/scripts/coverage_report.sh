#!/usr/bin/env bash
set -euo pipefail

# Configuration
COVERAGE_JSON="${COVERAGE_JSON:-coverage/coverage-summary.json}"
OUT_DIR="${COVERAGE_OUT_DIR:-coverage-report}"
THRESHOLD="${COVERAGE_THRESHOLD:-90}"
REPO_NAME="${GITHUB_REPOSITORY##*/}"
REPO_NAME="${REPO_NAME:-$(basename "$(pwd)")}"

# Create output directory
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Check if coverage file exists
if [ ! -f "$COVERAGE_JSON" ]; then
    echo "Error: Coverage file '$COVERAGE_JSON' not found"
    exit 1
fi

# Extract coverage data using Node.js (since we're in a Node.js project)
node -e "
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('$COVERAGE_JSON', 'utf8'));

const percentage = (covered, total) =>
  total === 0 ? 100.0 : Math.round((1000 * covered) / total) / 10;

// Calculate overall coverage
const total = summary.total;
const overallPct = total.lines.pct;
const coveredLines = total.lines.covered;
const totalLines = total.lines.total;

// Build module coverage
const modules = {};
Object.keys(summary).forEach((file) => {
  if (file === 'total') return;
  const moduleName = require('path').dirname(file) || '.';
  const stats = modules[moduleName] || (modules[moduleName] = { covered: 0, total: 0 });
  stats.covered += summary[file].lines.covered;
  stats.total += summary[file].lines.total;
});

// Sort modules by coverage
const sortedModules = Object.entries(modules)
  .map(([name, stats]) => ({
    name,
    pct: percentage(stats.covered, stats.total),
    covered: stats.covered,
    total: stats.total
  }))
  .sort((a, b) => a.pct - b.pct || a.name.localeCompare(b.name));

// Build table rows
const rows = sortedModules
  .map(m => \`| \\\`\${m.name}\\\` | \${m.pct}% | \${m.covered}/\${m.total} |\`)
  .join('\n');

// Determine status
const status = overallPct >= ${THRESHOLD} ? 'passing' : 'below threshold';

// Build markdown
const markdown = \`<!-- coverage-report -->
## Test coverage: \${overallPct}%

\${coveredLines} of \${totalLines} lines covered, threshold ${THRESHOLD}% (\${status}).

| Module | Coverage | Lines |
| --- | ---: | ---: |
\${rows}
\`;

// Write outputs
fs.mkdirSync('$OUT_DIR', { recursive: true });
fs.writeFileSync('$OUT_DIR/summary.md', markdown);
fs.writeFileSync('$OUT_DIR/total.txt', \`\${overallPct}\n\`);
fs.writeFileSync('$OUT_DIR/status.txt', \`\${status}\n\`);

// Set GitHub outputs
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, \`total=\${overallPct}\nstatus=\${status}\n\`);
}

console.log(\`${REPO_NAME}: \${overallPct}% (\${coveredLines}/\${totalLines}) \${status}\`);
"
