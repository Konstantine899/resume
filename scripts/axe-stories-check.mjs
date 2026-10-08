// scripts/axe-stories-check.mjs
//
// axe-core gate for Storybook stories (plan_kit_table, WU-2).
//
// `check:axe` scans the built app; it never sees a component that only
// exists in Storybook (kit primitives such as Table are wired into the
// showcase later, and in isolation their stories are the ONLY place the
// states — loading, empty, hideOnMobile — are rendered). This gate closes
// that hole: every matching story is rendered in both themes at a desktop
// and a mobile viewport and scanned with axe-core.
//
// Deviations from a naive implementation, both deliberate:
//   1. axe-core is loaded from `node_modules` first (the committed version,
//      offline-reproducible) with the CDN as a fallback only — see AXE_CDN.
//   2. Tag set: plan WU-2 asks for best-practice too (heading-order, cell
//      bindings, scrollable-region-focusable) — so WCAG A/AA (2.0 + 2.1) AND
//      best-practice FAIL the gate. `--wcag-only` narrows the scan when a
//      best-practice hit needs to be isolated from a WCAG one.
//      Two best-practice rules are disabled — see SHELL_RULES: they score
//      Storybook's iframe document, not the component under test.
//   3. No baseline file: a new kit component starts clean, and a silent
//      baseline would defeat the point of the gate.
//
// Usage:
//   node scripts/axe-stories-check.mjs                       # filter: table
//   node scripts/axe-stories-check.mjs --filter=badge
//   node scripts/axe-stories-check.mjs --build               # force rebuild
//   node scripts/axe-stories-check.mjs --wcag-only
//   node scripts/axe-stories-check.mjs --url=http://127.0.0.1:6006
//
// Exit code: 1 on any violation, unreadable story, or build/filter failure.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'storybook-static');
const INDEX_FILE = join(DIST, 'index.json');
const AXE_LOCAL = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
const AXE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BEST_PRACTICE_TAGS = ['best-practice'];
const THEMES = ['light', 'dark'];
const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
];
const RENDER_SELECTOR = '#storybook-root > *';
/**
 * Best-practice rules that describe the STORYBOOK DOCUMENT SHELL rather than
 * the component: the story iframe renders a bare `#storybook-root` div — no
 * `<main>` landmark and no `<h1>` — so `landmark-one-main` and
 * `page-has-heading-one` fire on EVERY story of EVERY component, always.
 * Scanning an embedded fragment with document-level rules disabled is the
 * standard component-testing setup; suppressing them hides nothing a
 * component can actually fix. Everything else (heading-order,
 * scrollable-region-focusable, color-contrast, cell bindings) stays on.
 */
const SHELL_RULES = {
  'landmark-one-main': { enabled: false },
  'page-has-heading-one': { enabled: false },
};
const THEME_SELECTOR = '[data-theme="%s"]';

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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const args = process.argv.slice(2);
const filterArg = args.find((a) => a.startsWith('--filter='));
const urlArg = args.find((a) => a.startsWith('--url='));
const FORCE_BUILD = args.includes('--build');
const WCAG_ONLY = args.includes('--wcag-only');
const FILTER = (filterArg ? filterArg.slice('--filter='.length) : 'table').toLowerCase();

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
    } catch (error) {
      if (error?.code === 'ENOENT') {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(500).end('server error');
    }
  });

  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => ready(server));
  });
}

function buildStorybook() {
  console.log('▸ building Storybook (npm run build-storybook)…');
  const result = spawnSync('npm', ['run', 'build-storybook'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error('✗ storybook build failed');
    process.exit(1);
  }
}

function loadStories() {
  if (!existsSync(INDEX_FILE)) {
    buildStorybook();
  } else if (FORCE_BUILD) {
    buildStorybook();
  }

  if (!existsSync(INDEX_FILE)) {
    console.error(`✗ ${INDEX_FILE} not found — \`npm run build-storybook\` produced nothing.`);
    process.exit(1);
  }

  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf8'));
  const entries = Object.values(index.entries ?? {});
  const stories = entries.filter((entry) => {
    if (entry.type !== 'story') return false;
    const haystack = `${entry.id} ${entry.title ?? ''} ${entry.name ?? ''}`.toLowerCase();
    return haystack.includes(FILTER);
  });

  if (stories.length === 0) {
    console.error(
      `✗ no story matches --filter=${FILTER}. If the build predates the stories, re-run with --build.`
    );
    process.exit(1);
  }
  return stories;
}

async function resolveAxeSource() {
  const local = await readFile(AXE_LOCAL, 'utf8').catch(() => null);
  if (local) {
    const manifest = JSON.parse(
      await readFile(join(ROOT, 'node_modules', 'axe-core', 'package.json'), 'utf8').catch(
        () => '{}'
      )
    );
    console.log(`▸ axe-core ${manifest.version ?? '(unknown version)'} (local)`);
    return { mode: 'local', content: local };
  }
  console.warn(`! local axe-core missing at ${AXE_LOCAL} — falling back to CDN`);
  return { mode: 'cdn', url: AXE_CDN };
}

async function main() {
  const stories = loadStories();
  const axe = await resolveAxeSource();

  let baseURL;
  let server = null;
  if (urlArg) {
    baseURL = urlArg.slice('--url='.length);
  } else {
    server = await startStaticServer();
    baseURL = `http://127.0.0.1:${server.address().port}`;
  }

  const tags = WCAG_ONLY ? WCAG_TAGS : [...WCAG_TAGS, ...BEST_PRACTICE_TAGS];
  const scans = VIEWPORTS.length * THEMES.length * stories.length;
  console.log(
    `▸ ${stories.length} stories × ${THEMES.length} themes × ${VIEWPORTS.length} viewports = ${scans} scans`
  );
  console.log(`▸ tags: ${tags.join(', ')}\n`);

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const failures = [];
  let scansRun = 0;

  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      // The preview decorator reads globals, but ThemeProvider also seeds
      // itself from localStorage — set both so they cannot disagree.
      await context.addInitScript((value) => window.localStorage.setItem('theme', value), theme);
      const page = await context.newPage();

      for (const story of stories) {
        const url =
          `${baseURL}/iframe.html?id=${encodeURIComponent(story.id)}` +
          `&viewMode=story&globals=theme:${theme}`;
        const label = `[${viewport.label}/${theme}] ${story.id}`;

        try {
          await page.goto(url, { waitUntil: 'load' });
          await page.waitForSelector(RENDER_SELECTOR, { timeout: 15_000 });
          await page.waitForSelector(THEME_SELECTOR.replace('%s', theme), { timeout: 5_000 });

          if (axe.mode === 'local') {
            await page.addScriptTag({ content: axe.content });
          } else {
            await page.addScriptTag({ url: axe.url });
          }
          const axeReady = await page.evaluate(() => typeof window.axe?.run === 'function');
          if (!axeReady) {
            throw new Error('axe-core did not load into the story iframe');
          }

          const results = await page.evaluate(
            ({ ruleTags, disabledRules }) =>
              window.axe.run(document, {
                runOnly: { type: 'tag', values: ruleTags },
                rules: disabledRules,
              }),
            { ruleTags: tags, disabledRules: SHELL_RULES }
          );
          scansRun += 1;

          if (results.violations.length === 0) {
            console.log(`✓ ${label}`);
          } else {
            console.log(`✗ ${label} — ${results.violations.length} violation(s)`);
            for (const violation of results.violations) {
              const targets = violation.nodes.slice(0, 3).map((n) => n.target.join(' '));
              console.log(
                `    - ${violation.id} (${violation.impact}) x${violation.nodes.length}: ${targets.join(' | ')}`
              );
              failures.push({
                story: story.id,
                theme,
                viewport: viewport.label,
                id: violation.id,
                impact: violation.impact,
                help: violation.help,
                targets,
              });
            }
          }
        } catch (error) {
          scansRun += 1;
          console.error(`✗ ${label} — story did not render / scan failed: ${error.message}`);
          failures.push({
            story: story.id,
            theme,
            viewport: viewport.label,
            id: 'story-render-failed',
            impact: 'critical',
            help: error.message,
            targets: [],
          });
        }
      }

      await context.close();
    }
  }

  await browser.close();
  if (server) server.close();

  console.log(`\n${scansRun}/${scans} scans completed`);
  if (failures.length > 0) {
    console.error(`✗ ${failures.length} problem(s) — see above.`);
    process.exit(1);
  }
  console.log('✓ no axe violations across all matched stories');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
