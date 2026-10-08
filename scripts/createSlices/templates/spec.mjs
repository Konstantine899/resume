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
 * Language: Russian — owner decision 2026-10-08 (SPEC.md/TODO.md are ALWAYS
 * Russian: headings + prose; frontmatter KEYS stay English because
 * `scripts/spec-tools.mjs` parses them). NOTE: § always renders as a backtick,
 * so never use a section sign § in prose.
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
  const redux = names.withSlice ? 'да (§--with-slice§)' : 'нет';
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
    '> Единственная истина для этого слайса (spec-driven workflow:',
    '> AGENTS.md, раздел Spec-driven features). Статусы: §draft§ → §approved§ → §done§.',
    '> §--scaffold§ заблокирован, пока во frontmatter нет §status: approved§.',
    '',
    '## Цель',
    '',
    '<!-- Что строим и зачем — один абзац. -->',
    '',
    '## Контекст',
    '',
    '- Слой: §' + names.layer + '§ (FSD), слайс: §' + names.name + '§',
    '- Redux-слайс: ' + redux,
    '- Зависимости / соседние слайсы: <!-- например, entities/Project -->',
    '',
    '## Критерии приёмки',
    '',
    '<!-- Критерий = наблюдаемый исход, а не оценка.',
    "     Пример: - [ ] неверный пароль → появляется надпись 'Invalid credentials'. -->",
    '',
    '- [ ] <!-- замените на наблюдаемые критерии; status: approved ставит владелец -->',
    '',
    '## Планируемые файлы',
    '',
    '<!-- Точные пути, которые эмитит §--scaffold§ (phase B); новые компоненты дописывайте сюда. -->',
    '',
    '- §index.ts§',
    '- §model/types/types.ts§',
    '- §ui/' + names.name + '/' + names.name + '.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.test.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.stories.tsx§',
    '- §ui/' + names.name + '/' + names.name + '.module.scss§',
    ...planSlice,
    '',
    '## Что не входит',
    '',
    '- <!-- явно вне области этого слайса -->',
    '',
    '## Риски',
    '',
    '- <!-- что может пойти не так или повлечь переделку -->',
    '',
    '## Открытые вопросы',
    '',
    '- <!-- решения, которые ещё за владельцем -->',
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
    'Компаньон к [SPEC.md](./SPEC.md). Правила сгорания: выполненная единица',
    '**удаляется**, а не отмечается; одна единица = один ревью-коммит; критерии',
    'приёмки живут в SPEC.md, здесь их нет.',
    '',
    '## Рабочие единицы',
    '',
    '- [ ] Заполнить §SPEC.md§ наблюдаемыми критериями; §status: approved§ ставит владелец',
    '- [ ] Заскаффолдить код: §npm run generate:slice -- ' +
      names.layer +
      ' ' +
      names.name +
      ' --scaffold§',
    '- [ ] Реализовать §ui/' +
      names.name +
      '/' +
      names.name +
      '.tsx§ по критериям (тесты до кода, где применимо)',
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
        "Slice';§ + зарегистрировать в карте reducers"
    );
  }
  lines.push(
    '- [ ] §src/pages/routerConfig.tsx§ / §src/pages/Home/ui/HomePage/HomePage.tsx§: при необходимости зарегистрировать маршрут или секцию главной',
    '- [ ] §src/shared/lib/i18n/locales/en.json§ + §ru.json§: добавить ключи только для пользовательского текста (генерируется пусто)',
    '- [ ] §npm run validate§ зелёный; при расхождении контракта обновить §verified§ в SPEC.md',
    ''
  );
  return render(lines.join('\n'));
}
