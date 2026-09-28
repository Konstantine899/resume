// scripts/purge-axe-check.mjs
//
// Post-build visual gate for the PurgeCSS transform (Phase 3, T11).
//
// PurgeCSS failure mode is silent: it deletes rules, the build stays green, and
// the page ships unstyled. `check:bundle` cannot see that — a nuked stylesheet
// is *smaller*, so it passes. This script proves the opposite:
//
//   1. CSS integrity — the rendered document must still expose a sane number of
//      class-bearing rules. The pre-rewrite PurgeCSS config shipped 93 classes
//      instead of ~680; the threshold below catches exactly that regression.
//   2. axe-core — no accessibility violation that is not already in the
//      committed baseline, in either theme.
//
// Usage:
//   node scripts/purge-axe-check.mjs                  # gate (exit 1 on regression)
//   node scripts/purge-axe-check.mjs --update-baseline
//   node scripts/purge-axe-check.mjs --url=http://127.0.0.1:4173
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'public');
const BASELINE_FILE = join(ROOT, 'scripts', 'purge-axe-baseline.json');
const AXE_SOURCE = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');

/** Below this many class-bearing rules the app is considered unstyled. */
const MIN_CLASS_RULES = 500;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const THEMES = ['light', 'dark'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

const args = process.argv.slice(2);
const updateBaseline = args.includes('--update-baseline');
const urlFlag = args.find((a) => a.startsWith('--url='));

function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const filePath = normalize(join(DIST, relative));
      if (!filePath.startsWith(DIST)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });

  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => ready(server));
  });
}

const fingerprint = (violation) => `${violation.id}|${violation.impact ?? 'unknown'}`;

function loadBaseline() {
  if (!existsSync(BASELINE_FILE)) return null;
  return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`✗ ${DIST} not found. Run \`npm run build\` first.`);
    process.exit(1);
  }

  const axeSource = await readFile(AXE_SOURCE, 'utf8').catch(() => null);
  if (!axeSource) {
    console.error(`✗ axe-core not found at ${AXE_SOURCE}. Run \`npm ci\`.`);
    process.exit(1);
  }

  const { chromium } = await import('@playwright/test');
  let server = null;
  let baseURL;

  if (urlFlag) {
    baseURL = urlFlag.slice('--url='.length);
  } else {
    server = await startStaticServer();
    baseURL = `http://127.0.0.1:${server.address().port}`;
  }

  const browser = await chromium.launch();
  const report = [];
  let failed = false;

  for (const theme of THEMES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // ThemeContext reads localStorage on mount — seed it before the app boots.
    await context.addInitScript((value) => window.localStorage.setItem('theme', value), theme);
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#root > *', { timeout: 15_000 });
    await page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme, {
      timeout: 5_000,
    });
    await page.addScriptTag({ content: axeSource });

    const metrics = await page.evaluate(() => {
      let classRules = 0;
      let totalRules = 0;

      const visit = (rules) => {
        for (const rule of rules) {
          totalRules += 1;
          if (rule.selectorText && /\.[A-Za-z_]/.test(rule.selectorText)) classRules += 1;
          if (rule.cssRules) visit(rule.cssRules);
        }
      };

      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        if (rules) visit(rules);
      }

      return { classRules, totalRules };
    });

    const results = await page.evaluate(
      (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
      AXE_TAGS
    );
    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    }));

    report.push({ theme, metrics, violations });

    console.log(
      `\n[${theme}] class rules: ${metrics.classRules} / total rules: ${metrics.totalRules} ` +
        `(axe violations: ${violations.length})`
    );
    for (const v of violations) {
      console.log(`  - ${v.id} (${v.impact}) x${v.nodes}: ${v.targets.join(' | ')}`);
    }

    if (metrics.classRules < MIN_CLASS_RULES) {
      console.error(
        `  ✗ CSS integrity failed: ${metrics.classRules} class rules < ${MIN_CLASS_RULES} — ` +
          'the stylesheet was over-purged.'
      );
      failed = true;
    }

    await context.close();
  }

  const baseline = loadBaseline();

  if (updateBaseline) {
    const payload = {
      generatedBy: 'scripts/purge-axe-check.mjs',
      minClassRules: MIN_CLASS_RULES,
      violations: report.flatMap((entry) =>
        entry.violations.map((v) => ({
          theme: entry.theme,
          fingerprint: fingerprint(v),
          nodes: v.nodes,
          help: v.help,
        }))
      ),
    };
    await writeFile(BASELINE_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`\n✓ baseline written (${payload.violations.length} known violations)`);
  } else if (!baseline) {
    console.error(
      `\n✗ No baseline at ${BASELINE_FILE}. Run with --update-baseline once, then commit it.`
    );
    failed = true;
  } else {
    const known = new Set((baseline.violations ?? []).map((v) => `${v.theme}|${v.fingerprint}`));
    for (const entry of report) {
      for (const v of entry.violations) {
        if (!known.has(`${entry.theme}|${fingerprint(v)}`)) {
          console.error(
            `\n✗ NEW ${entry.theme} violation: ${v.id} (${v.impact}) — ${v.targets.join(' | ')}`
          );
          failed = true;
        }
      }
    }
    if (!failed) {
      console.log(`\n✓ no regressions against baseline (${baseline.violations.length} known)`);
    }
  }

  await browser.close();
  if (server) server.close();
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
