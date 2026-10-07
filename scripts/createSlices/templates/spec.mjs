/**
 * Phase-A spec templates (REQ-G14) — the two files every slice starts with:
 * `spec/SPEC.md` (contract, survives) and `spec/TODO.md` (burn-down plan).
 *
 * The content is the DEFAULT SKELETON: acceptance criteria start as an empty
 * checklist, the Plan-files section mirrors what `--scaffold` (phase B) will
 * emit (REQ-G8), and the Work units carry the composition-root steps the
 * generator may never perform itself (REQ-G11).
 *
 * Backticks in Markdown are written as § and substituted on render — a literal
 * ` inside a JS template literal would have to be escaped dozens of times.
 * Language: English (Language Domain Contract — generated technical artifacts).
 */

const BACKTICK = String.fromCharCode(96);

/** @param {string} text @returns {string} */
function render(text) {
  return text.split('§').join(BACKTICK);
}

/** Today in `YYYY-MM-DD` (UTC) — frontmatter `created:`. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * `spec/SPEC.md` default content.
 * @param {{ layer: string, name: string, camel: string, withSlice?: boolean }} names
 * @returns {string}
 */
export function specMd(names) {
  const redux = names.withSlice ? 'yes (§--with-slice§)' : 'no';
  const planSlice = names.withSlice
    ? [
        '- §model/slices/' + names.camel + 'Slice.ts§',
        '- §model/slices/' + names.camel + 'Slice.test.ts§',
        '- §model/selectors/selectors.ts§',
      ]
    : [];

  const lines = [
    '---',
    'status: draft',
    'epic:',
    'issue:',
    'created: "' + today() + '"',
    'verified:',
    '---',
    '',
    '# SPEC — ' + names.layer + '/' + names.name,
    '',
    '> Single source of truth for this slice (spec-driven workflow:',
    '> AGENTS.md § Spec-driven features). Status flow: §draft§ → §approved§ → §done§.',
    '> §--scaffold§ stays blocked until the frontmatter says §status: approved§.',
    '',
    '## Goal',
    '',
    '<!-- What we are building and why — one paragraph. -->',
    '',
    '## Context',
    '',
    '- Layer: §' + names.layer + '§ (FSD), slice: §' + names.name + '§',
    '- Redux slice: ' + redux,
    '- Related slices / dependencies: <!-- e.g. entities/Project -->',
    '',
    '## Acceptance criteria',
    '',
    '<!-- A criterion = an observable outcome, not an evaluation.',
    "     Example: - [ ] wrong password → the message 'Invalid credentials' appears. -->",
    '',
    '- [ ] <!-- replace with observable criteria; set status: approved when done -->',
    '',
    '## Plan files',
    '',
    '<!-- Exact paths the §--scaffold§ phase emits; add extra components here as you plan them. -->',
    '',
    '- §index.ts§',
    '- §model/types/types.ts§',
    '- §ui/' + names.name + '/' + names.name + '.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.test.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.stories.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.module.scss§',
    ...planSlice,
    '',
    '## Non-goals',
    '',
    '- <!-- explicitly out of scope for this slice -->',
    '',
    '## Risks',
    '',
    '- <!-- what can go wrong or invite rework -->',
    '',
    '## Open questions',
    '',
    '- <!-- decisions the owner still has to make -->',
    '',
  ];
  return render(lines.join('\n'));
}

/**
 * `spec/TODO.md` default content — Work units (burn-down: completed items are
 * DELETED, never checked off).
 * @param {{ layer: string, name: string, camel: string, withSlice?: boolean }} names
 * @returns {string}
 */
export function todoMd(names) {
  const lines = [
    '---',
    'status: draft',
    'spec: SPEC.md',
    '---',
    '',
    '# TODO — ' + names.layer + '/' + names.name,
    '',
    'Companion to [SPEC.md](./SPEC.md). Burn-down rules: a completed Work unit is',
    '**deleted**, not checked; one Work unit = one reviewable unit; acceptance criteria',
    'live in SPEC.md, never here.',
    '',
    '## Work units',
    '',
    '- [ ] Fill §SPEC.md§ with observable acceptance criteria; owner sets §status: approved§',
    '- [ ] Scaffold the code: §npm run generate:slice -- ' + names.layer + ' ' + names.name + ' --scaffold§',
    '- [ ] Implement §ui/' + names.name + '/' + names.name + '.tsx§ per criteria (tests before code where applicable)',
  ];
  if (names.withSlice) {
    lines.push(
      '- [ ] §src/storeReducers.ts§: §import { ' +
        names.camel +
        "Reducer } from '@/" +
        names.layer +
        '/' +
        names.name +
        '/model/slices/' +
        names.camel +
        "Slice';§ + register it in the reducers map"
    );
  }
  lines.push(
    '- [ ] §src/pages/routerConfig.tsx§ / §src/pages/Home/ui/HomePage/HomePage.tsx§: register a route or home section if needed',
    '- [ ] §src/shared/lib/i18n/locales/en.json§ + §ru.json§: add keys only for user-facing text (none is generated)',
    '- [ ] §npm run validate§ green; update §verified§ in SPEC.md if the contract drifted',
    ''
  );
  return render(lines.join('\n'));
}
