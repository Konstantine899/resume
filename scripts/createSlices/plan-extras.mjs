/**
 * Plan-files extras (REQ-G16) — diff the SPEC "Планируемые файлы" section
 * against the standard code plan so an owner-planned component gets scaffolded
 * as a skeleton in the same `--scaffold` run.
 *
 * Rules (REQ-G16):
 *   - listed paths already in the standard plan are skipped (never duplicated);
 *   - ANY listed path under `ui/<Pascal>/` registers component `<Pascal>` — the
 *     full quad is emitted even when only e.g. the `.test.tsx` line is listed;
 *   - a `ui/` path whose standard plan already covers that directory
 *     (the slice's own component) is not re-registered;
 *   - everything else (lib/, model/, non-Pascal dirs) returns in `manual` for
 *     hand creation — the generator never guesses what it cannot own.
 *
 * The "Планируемые файлы" section runs from its heading to the next `## `
 * heading (Russian headings since 2026-10-08 — SPEC/TODO are always Russian).
 */
import path from 'node:path';

/**
 * @param {string} specContent full `spec/SPEC.md` content
 * @param {string[]} standardPaths relPaths the standard plan emits
 * @returns {{ components: string[], manual: string[] }} sorted, deduplicated
 */
export function planFileExtras(specContent, standardPaths) {
  const standard = new Set(standardPaths);
  const components = new Set();
  const manual = new Set();

  // Locate the section WITHOUT a single mega-regex: `^` needs the `m` flag to
  // match mid-string, but with `m` a lazy `$` alternative would terminate the
  // section at the first line end. Explicit slicing is unambiguous.
  const heading = specContent.match(/(?:^|\n)## Планируемые файлы[ \t]*\r?\n/);
  if (!heading) return { components: [], manual: [] };
  const rest = specContent.slice(heading.index + heading[0].length);
  const nextHeading = rest.search(/\n## /);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);

  for (const match of section.matchAll(/^-[ \t]+`([^`]+)`/gm)) {
    const relPath = match[1].trim().split(path.sep).join('/');
    if (standard.has(relPath)) continue;

    const uiMatch = relPath.match(/^ui\/([A-Z][A-Za-z0-9]*)\//);
    if (uiMatch) {
      const componentDir = `ui/${uiMatch[1]}/`;
      const coveredByStandard = [...standard].some((file) => file.startsWith(componentDir));
      if (!coveredByStandard) components.add(uiMatch[1]);
      continue;
    }
    manual.add(relPath);
  }

  return { components: [...components].sort(), manual: [...manual].sort() };
}
