# Knowledge Base Filesystem Architecture

**OpenCode ↔ Obsidian через filesystem MCP**

**Date:** 2026-07-25  
**Status:** Draft  
**Version:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture Overview](#3-architecture-overview)
4. [L1 — Structured Storage Schema](#4-l1--structured-storage-schema)
5. [L2 — Discovery Layer (Index Files)](#5-l2--discovery-layer-index-files)
6. [L3 — Agent Interface](#6-l3--agent-interface)
7. [Index Generator Script](#7-index-generator-script)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Token Cost Analysis](#9-token-cost-analysis)
10. [Risk Assessment](#10-risk-assessment)

---

## 1. Executive Summary

### Constraint

Только filesystem MCP. Никаких дополнительных MCP-серверов, баз данных, HTTP API, или Obsidian-плагинов.

### Problem

AI-агент тратит ~45 000 токенов на grep/glob по 80+ файлам при каждом поиске в базе знаний. Нет структуры для "zero-shot discovery" — агент не знает, что существует, пока не прочитает всё.

### Solution

Трёхуровневая архитектура на чистой файловой системе:

| Layer  | What                       | How                                                  |
| ------ | -------------------------- | ---------------------------------------------------- |
| **L1** | Структурированное хранение | Единая frontmatter-схема для каждой директории       |
| **L2** | Слой обнаружения           | Pre-computed индексные файлы `_index.md`, `_tags.md` |
| **L3** | Интерфейс агента           | AGENTS.md + skill с инструкциями по навигации        |

**Результат:** discovery за 1 read (~800 токенов) вместо grep по 80+ файлам (~45 000 токенов). **Экономия 98%.**

### Источники паттернов

Анализ 7 открытых решений (open-zk-kb, file-graph, mdaifs, markedup, obsidian-memory-layer, obsidian-knowledge-mcp, James Croft KB) показал консенсус:

- YAML frontmatter — универсальный носитель метаданных
- Файловая система — source of truth
- Индексные файлы — слой discovery
- Агентские инструкции — мост между структурой и AI

---

## 2. Current State Analysis

### 2.1 Структура vault

```
resume-app/                          # Obsidian vault
├── index.md                         # navigation hub
├── 25+ *.md                        # topic docs (root level)
├── Clippings/                       # 38 files, flat, no structure
│   ├── Агентная инженерия...md
│   ├── Архитектура ИИ‑агентов.md
│   ├── Большой гайд...md
│   ├── Я создал второй мозг...md
│   └── ...                          # 38 total, all flat
├── wiki/                            # 80+ files, flat
│   ├── button-component.md
│   ├── fsd-layers.md
│   └── ...
├── raw/                             # 14 project docs
├── logs/
└── temp/
```

### 2.2 Выявленные проблемы

| #   | Проблема                                                      | Влияние                                     |
| --- | ------------------------------------------------------------- | ------------------------------------------- |
| P1  | Clippings: все 38 файлов в одной плоскости, нет категоризации | Агент не может сузить поиск                 |
| P2  | Frontmatter: `tags: ["clippings"]` на всех файлах             | Бесполезно для фильтрации                   |
| P3  | Нет `summary` поля                                            | Агент читает весь файл, чтобы понять тему   |
| P4  | Нет `status` поля                                             | Нельзя отличить обработанное от нетронутого |
| P5  | wiki: 80+ файлов без `_index.md`                              | Агент не знает, что существует              |
| P6  | Нет lifecycle метаданных                                      | Устаревший контент не маркируется           |
| P7  | Нет связей clippings ↔ wiki                                   | Изолированные базы знаний                   |

### 2.3 Текущая стоимость discovery

- glob всех .md: ~1 read (небольшой)
- Чтение frontmatter из 10 файлов: ~10 reads
- Полный grep по 80+ файлам: ~45 000 токенов
- Результат: агент часто пропускает релевантный контент

---

## 3. Architecture Overview

### 3.1 Принципы

1. **Filesystem is the API** — никаких серверов, баз данных, сторонних MCP
2. **Indexes are pre-computed** — агент читает один файл вместо N
3. **Frontmatter is the schema** — каждый файл самодостаточен
4. **Agent instructions are the bridge** — AGENTS.md учит навигации
5. **Backward compatible** — существующие ссылки и структура не ломаются

### 3.2 Три слоя

```
┌─────────────────────────────────────────────────────┐
│  L3: Agent Interface                                 │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ AGENTS.md        │  │ .opencode/skills/        │   │
│  │ KB инструкции    │  │ kb-navigation/SKILL.md   │   │
│  └─────────────────┘  └──────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  L2: Discovery Layer                                  │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ Clippings/       │  │ wiki/                    │   │
│  │ ├─ _index.md     │  │ ├─ _index.md             │   │
│  │ ├─ _tags.md      │  │ └─ *.md                  │   │
│  │ └─ *.md          │  │                          │   │
│  └─────────────────┘  └──────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  L1: Structured Storage                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ Enhanced Frontmatter (YAML)                   │   │
│  │ ├─ summary, status, relevance, content_hash  │   │
│  │ ├─ tags (2+ per file, meaningful)            │   │
│  │ └─ related ([[wikilinks]] to wiki/)          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 4. L1 — Structured Storage Schema

### 4.1 Clippings frontmatter schema

Текущее:

```yaml
---
title: 'Архитектура ИИ‑агентов'
source: 'https://habr.com/ru/articles/1007922/'
author:
  - '[[Ата Ахунжанов]]'
published: 2026-03-08
created: 2026-06-14
description: '...'
tags:
  - 'clippings'
---
```

Целевое:

```yaml
---
title: 'Архитектура ИИ‑агентов'
source: 'https://habr.com/ru/articles/1007922/'
source_type: 'blog' # NEW: blog|docs|github|video|paper
author:
  - 'Ата Ахунжанов'
published: 2026-03-08
clipped: 2026-06-14 # RENAMED from "created"
verified: 2026-07-25 # NEW: дата верификации (null если не проверено)
status: 'processed' # NEW: unread|reading|processed|archived
relevance: 'core' # NEW: core|supporting|reference
tags: # ENHANCED: минимум 2 тега
  - 'ai-agents'
  - 'architecture'
  - 'workflow'
summary: > # NEW: 1-2 предложения для zero-shot discovery
  "Разбор архитектур ИИ-агентов от workflow (Prompt Chaining, Routing,
  Parallelization, Evaluator-Optimizer) до agent (ReAct, Orchestrator-Workers).
  Практические рекомендации когда какой подход использовать."
content_hash: 'sha256:a1b2c3...' # NEW: для dedup и freshness
deprecated: false # NEW: устаревший контент
related: # NEW: связи с wiki и другими clippings
  - '[[wiki/fsd-layers]]'
  - '[[Clippings/Как работают ИИ-агенты для разработки]]'
---
```

### 4.2 Wiki frontmatter schema

```yaml
---
title: 'Button Component'
type: 'component' # component|feature|entity|pattern|decision|guide
layer: 'shared' # FSD layer: app|pages|widgets|features|entities|shared
status: 'stable' # draft|review|stable|deprecated
created: 2026-06-01
updated: 2026-07-20
tags:
  - 'ui-kit'
  - 'button'
  - 'interaction'
summary: 'UI компонент кнопки с поддержкой иконок, loading state, и вариантов (primary/secondary/ghost)'
related:
  - '[[wiki/button-with-icon-component]]'
  - '[[wiki/icon-button-component]]'
  - '[[wiki/design-tokens]]'
---
```

### 4.3 JSON Schema для валидации

`schema/clippings.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Clipping",
  "type": "object",
  "required": ["title", "source", "clipped", "summary", "tags"],
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "source": { "type": "string", "format": "uri" },
    "source_type": { "enum": ["blog", "docs", "github", "video", "paper", null] },
    "status": { "enum": ["unread", "reading", "processed", "archived"] },
    "relevance": { "enum": ["core", "supporting", "reference"] },
    "tags": { "type": "array", "items": { "type": "string" }, "minItems": 2 },
    "summary": { "type": "string", "minLength": 20, "maxLength": 500 },
    "content_hash": { "type": "string", "pattern": "^sha256:" },
    "deprecated": { "type": "boolean" }
  }
}
```

---

## 5. L2 — Discovery Layer (Index Files)

### 5.1 `Clippings/_index.md`

Цель: один read = полный inventory. Категоризирован, отсортирован, с summary.

```markdown
---
title: 'Clippings Index'
updated: 2026-07-25
total: 38
status_counts:
  unread: 12
  reading: 3
  processed: 20
  archived: 3
---

# Clippings Index

## 🤖 AI Agents

| Title                                                                                       | Author | Date    | Relevance | Status    | Summary                                      |
| ------------------------------------------------------------------------------------------- | ------ | ------- | --------- | --------- | -------------------------------------------- |
| [Архитектура ИИ‑агентов](./Архитектура%20ИИ‑агентов.md)                                     | Ата А. | 2026-03 | core      | processed | Разбор архитектур от workflow до multi-agent |
| [Как работают ИИ-агенты для разработки](./Как%20работают%20ИИ-агенты%20для%20разработки.md) | —      | 2026-01 | core      | unread    | Обзор подходов к созданию AI-агентов         |

## 🔧 OpenCode & MCP

| Title                                                                                                    | Author   | Date    | Relevance | Status    | Summary                                                     |
| -------------------------------------------------------------------------------------------------------- | -------- | ------- | --------- | --------- | ----------------------------------------------------------- |
| [Большой гайд по настройке OpenCode](./Большой%20гайд%20по%20настройке%20OpenCode-проекта.md)            | —        | 2026-07 | core      | processed | Chapter-based guide: AGENTS.md, config, agents, skills, MCP |
| [Оптимизация AI-кодинга через MCP](./Как%20оптимизировать%20и%20поднять%20эффективность%20AI-Кодинга.md) | MalovNIk | 2025-11 | core      | processed | 6 MCP server стек, метрики экономии токенов                 |

## 🧪 Testing

...

## 🗄️ Git & Version Control

...

## 📐 Architecture

...

## 💰 Cost Optimization

...

## 📦 Redux Toolkit

...

## 📚 Other

...
```

### 5.2 `Clippings/_tags.md`

```markdown
---
title: 'Clippings Tag Index'
updated: 2026-07-25
---

# Tag Index

## ai-agents (8)

- [Архитектура ИИ‑агентов](./Архитектура%20ИИ‑агентов.md)
- [Как работают ИИ-агенты для разработки](./Как%20работают%20ИИ-агенты%20для%20разработки.md)
- [Агентная инженерия](./Агентная%20инженерия%20практическое%20руководство.md)
- ...

## opencode (5)

- [Большой гайд по настройке OpenCode](./Большой%20гайд%20по%20настройке%20OpenCode-проекта.md)
- ...

## testing (4)

- [Vitest and React Testing Library](./Vitest%20and%20React%20Testing%20Library.md)
- ...

## mcp (6)

- [Оптимизация AI-кодинга через MCP](./Как%20оптимизировать%20и%20поднять%20эффективность%20AI-Кодинга.md)
- ...
```

### 5.3 `wiki/_index.md`

```markdown
---
title: 'Wiki Index'
updated: 2026-07-25
total: 80+
---

# Wiki Index

## Components (25)

| Component                       | Layer  | Status | Summary                                   |
| ------------------------------- | ------ | ------ | ----------------------------------------- |
| [Button](./button-component.md) | shared | stable | Primary/secondary/ghost variants          |
| [Avatar](./avatar-component.md) | shared | stable | Family: Avatar, AvatarHero, AvatarAbout   |
| [Modal](./modal-component.md)   | shared | stable | With CloseButton, Content, Footer, Header |

## Features (8)

| Feature                         | Layer    | Status | Summary                             |
| ------------------------------- | -------- | ------ | ----------------------------------- |
| [Hero](./feature-hero.md)       | features | stable | Hero section with avatar + greeting |
| [Contact](./feature-contact.md) | features | stable | Form with EmailJS integration       |

## FSD Architecture (5)

| Document                              | Type     | Summary                            |
| ------------------------------------- | -------- | ---------------------------------- |
| [Layers](./fsd-layers.md)             | guide    | FSD layer mapping for this project |
| [Import Rules](./fsd-import-rules.md) | decision | Layer dependency rules             |

...
```

### 5.4 Алгоритм discovery (агентский)

```
1. Read {vault}/Clippings/_index.md
   → Узнаёт: 38 файлов по 8 категориям
   → Видит: relevance, status, summary каждой записи
   → Выбирает: категорию "AI Agents", файлы с relevance=core

2. Read frontmatter of target files (partial read)
   → Проверяет: status="processed", tags содержат искомое
   → Решает: читать полный контент или нет

3. Read full content of 1-2 most relevant files
   → Получает: полную информацию

Итого: 3 reads ≈ 2400 токенов (против 45 000 при grep)
```

---

## 6. L3 — Agent Interface

### 6.1 AGENTS.md блок

Добавить в `D:\Dev\tools\DBObsidian\resume-app\AGENTS.md`:

```markdown
## Knowledge Base Navigation

Vault path: `D:/Dev/tools/DBObsidian/resume-app`
Access: filesystem MCP (read/write allowed)

### Discovery Protocol

1. **Always start with index files**:
   - `read {vault}/Clippings/_index.md` — для поиска по Clippings
   - `read {vault}/wiki/_index.md` — для поиска по wiki
   - `read {vault}/index.md` — для общего overview

2. **Read frontmatter before content**:
   - `read {path} --head 15` — читает только YAML frontmatter
   - Проверь `summary`, `status`, `relevance` перед чтением полного файла
   - Пропусти файлы с `status: archived` или `deprecated: true`

3. **Tag-based filtering**:
   - `read {vault}/Clippings/_tags.md` — найди все файлы по тегу
   - Используй минимум 2 тега для точного поиска

### Writing Protocol

1. **Новый clipping**:
   - Добавь `summary` (1-2 предложения)
   - Установи `status: unread`, `relevance: reference`
   - Добавь минимум 2 тега (source + topic)
   - Обнови `Clippings/_index.md` и `Clippings/_tags.md`

2. **Обновление существующего**:
   - Обнови `verified` дату
   - Измени `status` на `processed` если прочитал
   - Добавь `related` ссылки на связанные wiki-страницы

3. **Устаревание**:
   - Установи `deprecated: true`
   - Добавь `deprecated_note: "Причина"` в frontmatter
```

### 6.2 Skill: kb-navigation

`.opencode/skills/kb-navigation/SKILL.md`:

```markdown
# Knowledge Base Navigation Skill

## Trigger

Ключевые слова: "найди в базе", "поищи в Obsidian", "check knowledge base",
"what do we have on", "посмотри в Clippings", "есть ли у нас"

## Workflow

### Phase 1 — Identify

1. Определи тему запроса
2. Выбери целевой раздел: Clippings (статьи) или wiki (проектная документация)
3. Прочитай соответствующий `_index.md`

### Phase 2 — Filter

1. Найди строки, соответствующие теме
2. Отфильтруй по relevance (core > supporting > reference)
3. Отфильтруй по status (processed > unread, skip archived)

### Phase 3 — Retrieve

1. Прочитай frontmatter 2-3 лучших кандидатов
2. Прочитай полный контент 1-2 наиболее релевантных
3. Если информации недостаточно — перейди к другой категории

### Phase 4 — Synthesize

1. Объедини информацию из разных источников
2. Укажи источник и уровень уверенности
3. Отметь gaps (что не нашли, но должно быть)

## Output

- Найденная информация с source attribution
- Confidence: high (processed+core) / medium (unread+supporting) / low (archived)
- Gaps: темы, по которым ничего не найдено
```

### 6.3 OpenCode command

В `opencode.json` (проектный или глобальный):

```json
{
  "command": {
    "kb-rebuild": {
      "description": "Rebuild knowledge base index files",
      "template": "Read all .md files in {vault}/Clippings/ and {vault}/wiki/, extract frontmatter, and regenerate _index.md and _tags.md files. Preserve existing content after the frontmatter block in _index.md. Use the schema from docs/specs/kb-filesystem-architecture.md."
    }
  }
}
```

---

## 7. Index Generator Script

### 7.1 Specification

**File:** `D:\Dev\tools\DBObsidian\resume-app\scripts\generate-knowledge-index.ts`

**Input:** Clippings/_.md, wiki/_.md  
**Output:** Clippings/\_index.md, Clippings/\_tags.md, wiki/\_index.md

**Logic:**

```
for each directory in [Clippings, wiki]:
    for each .md file (skip _index.md, _tags.md):
        parse YAML frontmatter
        extract: title, tags, summary, status, relevance, author, date, type, layer

    categorize by tags (Clippings) or type (wiki)
    sort by relevance (core first) then date (newest first)

    write _index.md:
        - frontmatter: updated, total, counts
        - sections with tables: [Title, Author, Date, Relevance, Status, Summary]
        - truncate summary to 80 chars in table, full in tooltip

    write _tags.md:
        - group files by tag
        - sort tags alphabetically
        - sort files by relevance within tag
```

**Dependencies:** `js-yaml`, `glob` (npm packages in vault)  
**Run:** `npx ts-node scripts/generate-knowledge-index.ts`  
**Git hook:** `post-merge` и `post-commit` в `.husky/post-*`

### 7.2 Pseudo-implementation

```typescript
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { load } from 'js-yaml';

interface ClippingFrontmatter {
  title: string;
  tags: string[];
  summary?: string;
  status?: 'unread' | 'reading' | 'processed' | 'archived';
  relevance?: 'core' | 'supporting' | 'reference';
  author?: string | string[];
  published?: string;
  [key: string]: unknown;
}

function parseFrontmatter(filePath: string): ClippingFrontmatter | null {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return load(match[1]) as ClippingFrontmatter;
}

function categorizeByTags(frontmatter: ClippingFrontmatter): string[] {
  // Map first meaningful tag to section name
  const sectionMap: Record<string, string> = {
    'ai-agents': 'AI Agents',
    opencode: 'OpenCode & MCP',
    mcp: 'OpenCode & MCP',
    testing: 'Testing',
    git: 'Git & Version Control',
    architecture: 'Architecture',
    'cost-optimization': 'Cost Optimization',
    redux: 'Redux Toolkit',
  };
  const tag = frontmatter.tags?.find((t) => sectionMap[t]) || 'Other';
  return [sectionMap[tag] || 'Other'];
}

function generateClippingsIndex(directory: string): string {
  const files = readdirSync(directory)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ path: join(directory, f), name: f }));

  const entries = files
    .map((f) => ({
      fm: parseFrontmatter(f.path),
      path: f.name,
    }))
    .filter((e) => e.fm !== null);

  const sections: Record<string, typeof entries> = {};
  for (const entry of entries) {
    const cats = categorizeByTags(entry.fm!);
    for (const cat of cats) {
      (sections[cat] ??= []).push(entry);
    }
  }

  // Build markdown
  let md = '---\n';
  md += `title: "Clippings Index"\n`;
  md += `updated: ${new Date().toISOString().split('T')[0]}\n`;
  md += `total: ${entries.length}\n`;
  md += '---\n\n';
  md += '# Clippings Index\n\n';

  for (const [section, items] of Object.entries(sections)) {
    md += `## ${section}\n\n`;
    md += '| Title | Author | Date | Relevance | Status | Summary |\n';
    md += '|-------|--------|------|-----------|--------|--------|\n';
    for (const item of items.sort(byRelevanceThenDate)) {
      const title = item.fm!.title;
      const author = Array.isArray(item.fm!.author) ? item.fm!.author[0] : item.fm!.author || '—';
      const date = item.fm!.published || item.fm!.clipped || '—';
      const relevance = item.fm!.relevance || 'reference';
      const status = item.fm!.status || 'unread';
      const summary = (item.fm!.summary || '').slice(0, 80) + '...';
      const encodedPath = encodeURI(item.path);
      md += `| [${title}](${encodedPath}) | ${author} | ${date} | ${relevance} | ${status} | ${summary} |\n`;
    }
    md += '\n';
  }

  return md;
}

function byRelevanceThenDate(a: any, b: any): number {
  const rank = { core: 0, supporting: 1, reference: 2 };
  const ar = rank[a.fm.relevance || 'reference'] ?? 2;
  const br = rank[b.fm.relevance || 'reference'] ?? 2;
  if (ar !== br) return ar - br;
  return (b.fm.published || '').localeCompare(a.fm.published || '');
}
```

---

## 8. Implementation Roadmap

### Phase 1 — Foundation (Day 1)

| Step | Action                                        | Files                           | Effort |
| ---- | --------------------------------------------- | ------------------------------- | ------ |
| 1.1  | Утвердить frontmatter schema для Clippings    | —                               | 30min  |
| 1.2  | Написать JSON Schema для валидации            | `.schema/clippings.schema.json` | 30min  |
| 1.3  | Написать JSON Schema для wiki                 | `.schema/wiki.schema.json`      | 30min  |
| 1.4  | Создать `scripts/generate-knowledge-index.ts` | 1 файл, ~150 строк              | 2h     |
| 1.5  | Установить зависимости (`js-yaml`, `glob`)    | `package.json`                  | 10min  |

### Phase 2 — Clippings Enhancement (Day 1-2)

| Step | Action                                               | Effort           |
| ---- | ---------------------------------------------------- | ---------------- |
| 2.1  | Добавить `summary` в frontmatter всех 38 clippings   | 2h               |
| 2.2  | Добавить `status`, `relevance` во все clippings      | 1h               |
| 2.3  | Обогатить `tags` (минимум 2 meaningful тега на файл) | 1.5h             |
| 2.4  | Добавить `source_type` во все clippings              | 30min            |
| 2.5  | Добавить `content_hash` (SHA256 title+source)        | 30min (скриптом) |

### Phase 3 — Index Generation (Day 2)

| Step | Action                                                                 | Effort |
| ---- | ---------------------------------------------------------------------- | ------ |
| 3.1  | Запустить `generate-knowledge-index.ts` — создать Clippings/\_index.md | 10min  |
| 3.2  | Запустить `generate-knowledge-index.ts` — создать Clippings/\_tags.md  | 10min  |
| 3.3  | Запустить `generate-knowledge-index.ts` — создать wiki/\_index.md      | 10min  |
| 3.4  | Верифицировать индексы: прочитать глазами, проверить ссылки            | 30min  |
| 3.5  | Добавить husky hook `post-merge` для авто-регенерации                  | 30min  |

### Phase 4 — Agent Integration (Day 2-3)

| Step | Action                                        | Files                                     | Effort |
| ---- | --------------------------------------------- | ----------------------------------------- | ------ |
| 4.1  | Добавить KB Navigation блок в `AGENTS.md`     | vault AGENTS.md                           | 1h     |
| 4.2  | Создать skill `kb-navigation`                 | `.opencode/skills/kb-navigation/SKILL.md` | 1h     |
| 4.3  | Добавить command `/kb-rebuild`                | opencode.json                             | 15min  |
| 4.4  | Тест: "найди в базе информацию по AI агентам" | —                                         | 30min  |

### Phase 5 — Cross-linking (Day 3-4)

| Step | Action                                                  | Effort |
| ---- | ------------------------------------------------------- | ------ |
| 5.1  | Добавить `related` поля в clippings, связывающие с wiki | 2h     |
| 5.2  | Добавить `related` поля в wiki, связывающие с clippings | 2h     |
| 5.3  | Обновить `_index.md` с учётом cross-links               | auto   |

---

## 9. Token Cost Analysis

### 9.1 Discovery: было → стало

| Scenario                                         | Before (tokens)              | After (tokens)                          | Savings   |
| ------------------------------------------------ | ---------------------------- | --------------------------------------- | --------- |
| "Что у нас есть по AI агентам?"                  | 45 000 (grep 38 files)       | 800 (read \_index.md)                   | **98.2%** |
| "Найди статью про OpenCode настройку"            | 45 000 (grep 38 files)       | 1 200 (\_index.md + frontmatter 1 file) | **97.3%** |
| "Какие тесты используем?"                        | 35 000 (grep 80+ wiki files) | 800 (read wiki/\_index.md)              | **97.7%** |
| "Есть ли у нас информация по cost optimization?" | 45 000 (grep 38 files)       | 800 (read \_index.md + \_tags.md)       | **98.2%** |

### 9.2 Maintenance cost

| Operation                                     | Tokens |
| --------------------------------------------- | ------ |
| Добавить новый clipping + обновить \_index.md | ~2 000 |
| Обновить статус + перегенерировать индекс     | ~1 500 |
| Полная регенерация всех индексов              | ~5 000 |

### 9.3 Net effect

- Первый поиск в сессии: было 45 000 → стало 800 (**-98%**)
- Последующие поиски: 0 (контекст уже содержит \_index.md)
- Окупаемость: после 1-2 поисков инвестиция в индексы окупается

---

## 10. Risk Assessment

| Risk                                                                                        | Impact | Probability | Mitigation                                                                                                       |
| ------------------------------------------------------------------------------------------- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| **Stale indexes**: агент читает \_index.md, но файлы изменились                             | Medium | High        | Husky hook + command `/kb-rebuild` + AGENTS.md rule "regenerate after write"                                     |
| **Frontmatter parse errors**: YAML невалиден                                                | Low    | Low         | JSON Schema валидация перед записью                                                                              |
| **Broken wikilinks**: `related` ссылки указывают в никуда                                   | Medium | Medium      | Скрипт валидации ссылок при регенерации                                                                          |
| **Token waste on large \_index.md**: файл будет прочитан даже когда не нужен                | Low    | Low         | \_index.md ~5-8KB, это ~2000 токенов — меньше одного grep                                                        |
| **Human editing breaks format**: человек редактирует \_index.md в Obsidian и ломает таблицу | Medium | Medium      | Скрипт перезаписывает \_index.md целиком. Человеческие правки — в отдельную секцию `## Manual Notes` внизу файла |
| **Content_hash false positives**: статья обновилась, но hash совпал                         | Low    | Low         | Hash вычисляется из title + source URL, не из тела статьи                                                        |

---

## Appendix A: File Manifest

### New files to create

```
D:\Dev\tools\DBObsidian\resume-app\
├── .schema/
│   ├── clippings.schema.json       # JSON Schema for Clippings/
│   └── wiki.schema.json            # JSON Schema for wiki/
├── Clippings/
│   ├── _index.md                   # Auto-generated: categorized index
│   └── _tags.md                    # Auto-generated: tag-based index
├── wiki/
│   └── _index.md                   # Auto-generated: component/feature index
├── scripts/
│   └── generate-knowledge-index.ts # Index generator script
└── .husky/
    └── post-merge                  # Git hook for auto-reindex
```

### Files to modify

```
D:\Dev\tools\DBObsidian\resume-app\
├── AGENTS.md                       # Add KB Navigation block
├── Clippings/*.md                  # Enhance frontmatter (38 files)
└── wiki/*.md                       # Add frontmatter where missing

D:\Dev\projects\resume\
└── .opencode/
    ├── skills/kb-navigation/SKILL.md  # New skill
    └── opencode.json                  # Add /kb-rebuild command
```

---

## Appendix B: Agent Discovery Flow (Decision Tree)

```
User asks a knowledge question
        │
        ▼
Does it relate to external knowledge?
        │
    ┌───┴───┐
    │       │
   Yes     No
    │       │
    ▼       ▼
Read      Read
Clippings/ wiki/
_index.md _index.md
    │       │
    ▼       ▼
Find     Find
section  component/
by tags  by layer/type
    │       │
    ▼       ▼
Filter by Filter by
relevance status
+ status  + summary
    │       │
    ▼       ▼
Read      Read
frontmatter (head 15 lines)
    │
    ▼
Read full content
of 1-2 best matches
    │
    ▼
Synthesize + cite sources
```

---

## Appendix C: Related Projects Analysis

| Project                    | Approach            | Filesystem-only? | Key Pattern                                                        |
| -------------------------- | ------------------- | ---------------- | ------------------------------------------------------------------ |
| **open-zk-kb**             | MCP server + SQLite | No               | Hybrid: files = source of truth, SQLite = query layer              |
| **file-graph**             | Pure filesystem     | **Yes**          | Directories = types, frontmatter = edges, agents navigate natively |
| **mdaifs**                 | MCP server + Python | No               | BM25 + semantic search + knowledge graph from frontmatter          |
| **markedup**               | MCP server + Go     | No               | In-memory index from frontmatter, MCP for queries                  |
| **obsidian-memory-layer**  | MCP server          | No               | Session/progress/decision tracking in markdown                     |
| **obsidian-knowledge-mcp** | MCP server          | No               | 35+ tools for vault I/O, frontmatter, wikilinks                    |
| **This plan**              | **Pure filesystem** | **Yes**          | Pre-computed indexes + agent instructions                          |
