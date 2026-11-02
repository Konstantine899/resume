---
status: done
epic: about-admin-sections
created: '2026-11-01'
spec: 1
---

# SPEC — features/AdminAbout (секционная админка, эпик `about-admin-sections`)

> Единственная истина для этого эпика (spec-driven workflow: AGENTS.md).
> Статусы: `draft` → `approved` → `done`. Источник: vault
> `wiki/plan/todo/about-admin-sections-refactor.md` rev.2 (критический разбор
> практик 2026, дыры C1–C11); вердикт владельца по OPEN-1..OPEN-5 — 2026-11-01
> (все варианты А; OPEN-2 — «href в v3 не открывать»). Историческая пара
> эпика `admin-about-table` сохранена в git. Companion: [TODO.md](./TODO.md).
> Язык: русский. Все user-facing строки — i18n-ключи en+ru.

## Цель

Единая таблица `AboutEditorList` [Поле | EN | RU | Действия] (смешивает
абзацы `description-0..N`, показатели `stat-*` и подпись CTA) заменяется
ПЯТЬЮ независимыми свёрнутыми по умолчанию kit Card-блоками, повторяющими
блоки витрины `features/About`: «Основное», «Описания», «Технологии»,
«Показатели», «CTA». Стек технологий впервые становится редактируемым
(контракт v3 — отдельная пара `entities/AboutContent/spec/`).

## Контекст (факты, проверено 2026-11-01)

- `AboutEditorList.tsx` — 802 строки: единая таблица + отдельный
  fullName-блок + портрет-модалка; collapse контента = `useState(false)`
  БЕЗ персистентности.
- Save-seam `lib/saveAboutDocument.ts`: persist-THEN-dispatch, при 409 —
  `aboutConflictError`; текущая семантика store-overwrite при конфликте
  молча перезаписывает правки второго редактора (дыра C1).
- Per-field zod-слайсы `lib/fieldSchemas.ts` (add/remove строк, лимиты
  600/40/60) — остаются источником истины валидации.
- Collapse-геометрия-эталон: `resume-skills-card-collapse` (caption снаружи +
  strip Plus; развёрнут — Minus; `aria-expanded="false"` + `aria-controls` на
  стабильный id, `"true"` БЕЗ aria-controls).
- page-тесты обязаны СНАЧАЛА раскрывать карточку перед кликом по её
  действиям (`resume-jobs-detail-table`, `resume-skills-card-collapse`).
- Бандл: кап `total.maxSize` = 933888; фактический размер требует
  перепроверки ПЕРЕД WU-4 (замер ~904.8 КБ устарел).

## Решения

- **R-1 — пять карточек**: 1) «Основное» (вердикт OPEN-1=А) — `fullName`
  (Input + inline Save) + превью портрета, кнопка → текущая портрет-модалка
  (контракт WU-14/WU-20 не меняется); 2) «Описания» — абзацы EN/RU Textarea
  ≤600, Pencil → `AboutFieldEditForm`, Trash2 → confirm, «Добавить абзац» в
  шапке, пагинация не нужна (3–6 строк); 3) «Технологии» — NEW (см. R-4); 4) «Показатели» — таблица стат-строк без смены семантики; 5) «CTA» —
  подпись EN/RU ≤40 + переключатель «ссылка скрыта» (null = скрыто),
  `href` фиксирован `#contact` (вердикт OPEN-2: не открывать в v3).
- **R-2 — персистентность сворачивания (C2)**: версионированный ключ
  localStorage `admin-about:collapsed`; ВСЕ чтения/записи в try/catch
  (приватный режим → работаем без персистентности, не падаем); устаревшие
  ключи вычищаются (prune). Дефолт — свёрнуты.
- **R-3 — ошибка валидации**: карточка с ошибкой принудительно
  раскрывается, скролл к ней + фокус на первое невалидное поле; счётчик
  символов отдельно для КАЖДОЙ локали, превышение 600/40 ловится до
  сабмита (ошибка i18n, не обрезка).
- **R-4 — блок «Технологии»**: тоггл-чипы из каталога
  `entities/Technology` (features/AdminAbout → entities/Technology legal),
  display `name ?? key`; выбранные — чипы с X в порядке документа; порядок =
  порядок выбора; `stack` через save-seam. Ключ вне каталога: honest data
  (предупреждение в админке, бейдж в витрине), НЕ ломает рендер и
  сохранение остальных полей. EmptyState для пустого каталога. Combobox —
  НЕ здесь (порог 20, `searchable-tech-combobox-feature.md`).
- **R-5 — 409 без потери чужих правок (C1, вердикт OPEN-5=А)**: при
  конфликте — показать «документ изменён кем-то ещё» и предложить
  перезагрузить с переносом локальных правок; БЕЗ автоматического merge;
  молчаливый store-overwrite запрещён. Three-way merge — отдельный эпик.
- **R-6 — единица таблицы умирает**: колонки разбираются по карточкам
  2/4/5; пагинация единой таблицы (D18) исчезает вместе с ней; мёртвый SCSS
  удаляется. Шапка (h2/hint/кнопки) и все модалки — ВНЕ карточек,
  доступны всегда.
- **R-7 — Reset/seed не пишет `stack`** (вердикт OPEN-4): оставляет
  `undefined` → витрина фолбэчит `PROFILE_STACK`.

## Контракт (наблюдаемое поведение)

- /admin/about: 5 карточек, свёрнуты по умолчанию; единой таблицы нет.
- Состояние сворачивания переживает перезагрузку; без localStorage —
  всё работает, дефолт «свёрнуты», без падений.
- Ошибка валидации блока → его карточка раскрыта, скролл, фокус на первом
  невалидном поле.
- Правки всех блоков сохраняются через существующий save-seam;
  persist-THEN-dispatch соблюдён; 409 → конфликт-диалог (R-5), правки
  второго редактора НЕ перезаписываются молча.
- Ключ stack вне каталога: документ рендерится и сохраняется без ошибок.
- Лимиты: абзац ≤600/локаль, CTA ≤40/локаль — счётчики в обеих локалях,
  ошибка до сабмита.

## Критерии готовности

- [ ] Пара `spec/` перезаписана эпиком `about-admin-sections`
      (status: approved до старта кода); `npm run check:spec`: ВСЕ спеки
      эпика approved, нарушения — ТОЛЬКО внешние (известно: `shared/ui/Modal`
      draft чужого эпика `modal-content-interface-migration` — не наш
      блокер, в `validate`/CI гейт не входит).
- [ ] 5 свёрнутых по умолчанию карточек; единой таблицы и её SCSS нет;
      шапка/модалки доступны без раскрытия.
- [ ] Свёрнутость переживает перезагрузку (localStorage, try/catch);
      тест на недоступный localStorage зелёный.
- [ ] Ошибка валидации раскрывает свою карточку + скролл + фокус
      (тест наблюдаемого исхода).
- [ ] Счётчики EN/RU: 600 (абзацы) и 40 (CTA) ловятся до сабмита.
- [ ] Блок «Технологии»: выбор/снятие чипов, порядок документа, ключ вне
      каталога не ломает документ (тесты).
- [ ] 409: конфликт-диалог показан, молчаливый overwrite отсутствует
      (тест на поведение при конфликте).
- [ ] Characterization: дефолтный документ → DOM витрины идентичен
      (внешний WU-3), SCSS `features/About` не тронут.
- [ ] Гейты: `npm run validate`, `check:spec`, `check:axe` (0 регрессий,
      baseline не обновлялся в CI), `check:bundle` (кап НЕ трогать;
      перепроверить фактический размер ПЕРЕД стартом WU-4), превью-смоук
      light+dark без сырых ключей.
- [ ] PR `--base dev` (ВСЕГДА явно), squash; issue закрывается вручную.

## Вне скоупа

- Контракт `stack` (schema/types/seed) — `entities/AboutContent/spec/`.
- Backend: схема/Prisma/aggregate/репозиторий/e2e —
  `backend/src/modules/content/spec/`.
- `PROFILE_STACK` / `SkillsCode` не трогаются (split-brain — отдельный
  эпик; вердикт OPEN-3).
- Редактирование `href` CTA — отложено до после стабилизации v3 (OPEN-2).
- SCSS витрины `features/About/**` — без изменений.
- Смена семантики null-CTA — approval gate владельца.

## Связи

- Эталоны: #286 (Contact-строки), #227 (field-модалки), #223 (collapse),
  #315 (текущая витрина About).
- Уроки: `resume-jobs-detail-table` (expand-before-click в page-тестах),
  `resume-skills-card-collapse` (aria-контракт strip), `resume-axe-stale-build`
  (build ДО check:axe/bundle), `resume-gitignore-md` (git status перед
  коммитом .md).

## UI cleanup v2 (plan `admin-about-refactor-v2.md`)

Status: approved (automatic)
Date: 2026-11-01

Scope: короткая очистка admin UX после WU-0..WU-7:

- portrait editing in Main card only;
- remove duplicate action buttons;
- Descriptions/Stats rows represented as kit Table;
- CTA 'Hire me' edited in modal;
- Technology table with DB-catalog Select modal and key-only persistence;
- no change to public About contract semantics;
- i18n/parity + a11y + local storage + harness updates.

Non-goals: no new backend workflow beyond payload/DTO verification.
