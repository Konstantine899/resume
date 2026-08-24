# ADR 0006: Gentle AI Orchestrator

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The project uses OpenCode as the AI-assisted development environment. Without a structured workflow:

- AI agents tend to make uncontrolled changes across the codebase
- Context is lost between sessions
- Code quality degrades without systematic review
- Specs and implementation drift apart over time

A coordinator layer is needed to manage multi-agent workflows with predictable phases, explicit handoffs, and quality gates.

## Decision

Implement **Gentle AI SDD (Spec-Driven Development)** with a dedicated orchestrator agent:

**Architecture:**

1. **`gentle-orchestrator`** — primary agent that never does work inline; decomposes tasks and delegates to sub-agents
2. **8 SDD phases**: Explore → Propose → Spec → Design → Tasks → Apply → Verify → Archive
3. **4 project sub-agents**: guard, review, integration-test, git-commit
4. **3 model variants** (default, DeepSeek, Qwen) for each SDD phase
5. **Engram** for cross-session memory (decisions, discoveries, session summaries)
6. **Review contract** with 4R lenses (risk, readability, reliability, resilience) + Judgment Day protocol

**Key principles:**

- Orchestrator `max_tokens`: 16000 — enough for complex coordination
- Plan mode `max_tokens`: 8000 — analysis-only, no code generation
- MCP disabled by default, enabled only in orchestrator agents
- Permission whitelist for sub-agents — orchestrator can only call known agents

## Consequences

### Positive

- Predictable development cycle — every change follows the same phases
- Quality gates between phases — drift is caught early
- Context survives across sessions via Engram
- Review is systematic, not ad-hoc
- Clear separation of concerns (orchestrator vs executor agents)

### Negative

- Overhead for trivial changes (single-file bugfixes bypass SDD)
- Orchestrator context inflation if not disciplined about delegation
- Multi-model configuration adds complexity
- Learning curve for new contributors

## Alternatives Considered

| Alternative                    | Reason against                                              |
| ------------------------------ | ----------------------------------------------------------- |
| Single monolith agent          | One agent does everything — context overload, no separation |
| No orchestration               | Each session starts fresh; no process consistency           |
| External CI/CD as orchestrator | CI is post-commit; orchestrator should guide pre-commit     |
| Manual process                 | Doesn't scale; developers skip steps under pressure         |
