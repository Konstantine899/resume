/**
 * Shared scanner + frontmatter parser for the spec tooling (REQ-G17/G18) —
 * ONE parser feeds `check:spec`, `spec:status` AND the scaffold gate
 * (REQ-G15), so a status can never mean three different things.
 *
 * NOTE: block comments in this repo must never contain the two-character
 * sequence `*` + `/` — it silently closes the comment (the classic
 * `src/<stars>/spec` landmine).
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Frontmatter `status:` value of a SPEC; null when frontmatter or the key is
 * absent.
 * @param {string} specContent
 * @returns {string | null}
 */
export function readSpecStatus(specContent) {
  return readFrontmatterField(specContent, 'status');
}

/**
 * Frontmatter `verified:` value (quotes stripped); null when absent/empty.
 * @param {string} specContent
 * @returns {string | null}
 */
export function readSpecVerified(specContent) {
  return readFrontmatterField(specContent, 'verified');
}

/**
 * @param {string} specContent
 * @param {string} field
 * @returns {string | null}
 */
function readFrontmatterField(specContent, field) {
  const frontmatter = specContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const block = frontmatter ? frontmatter[1] : '';
  const match = block.match(new RegExp('^' + field + ':[ \\t]*(.*?)[ \\t]*$', 'm'));
  if (!match) return null;
  const raw = match[1].trim();
  if (!raw) return null;
  const unquoted = raw.match(/^"([^"]*)"|^'([^']*)'$/);
  return unquoted ? (unquoted[1] ?? unquoted[2]) : raw;
}

/**
 * @typedef {{ sliceDir: string, specPath: string, status: string | null, verified: string | null }} SpecEntry
 * `sliceDir`/`specPath` are `/`-separated and relative to `<root>` (e.g.
 * `src/features/About`), sorted ascending.
 */

/**
 * Walk `<root>/src` for every `spec/SPEC.md`. A missing `src/` is not an
 * error — it simply means zero specs (a fresh checkout of an empty root).
 * @param {string} root
 * @returns {Promise<SpecEntry[]>}
 */
export async function scanSpecs(root) {
  const srcDir = path.join(root, 'src');
  let entries;
  try {
    entries = await readdir(srcDir, { recursive: true });
  } catch (error) {
    if (error != null && error.code === 'ENOENT') return [];
    throw error;
  }

  const specs = [];
  for (const entry of entries) {
    const rel = entry.split(path.sep).join('/');
    if (!rel.endsWith('/spec/SPEC.md')) continue;
    const sliceDir = rel.slice(0, -'/spec/SPEC.md'.length);
    const content = await readFile(path.join(srcDir, entry), 'utf8');
    specs.push({
      sliceDir: `src/${sliceDir}`,
      specPath: `src/${sliceDir}/spec/SPEC.md`,
      status: readSpecStatus(content),
      verified: readSpecVerified(content),
    });
  }
  specs.sort((a, b) => a.sliceDir.localeCompare(b.sliceDir));
  return specs;
}
