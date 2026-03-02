---
name: orchestrator
description: The master control script for running agents and complex multi-step tasks. Based on orchestrator.ts.
---

# ORCHESTRATOR SKILL

The central engine for executing coordinated agent tasks.

## 🛠️ Workflow
1. **Task Parsing**: Interprets complex user queries into agent actions.
2. **Multi-Agent Coordination**: Hands off tasks between Bob, Chris, Laya, etc.
3. **Fix Mode**: Automatically attempts to resolve detected inconsistencies.

## 🚀 Execution
Run via terminal:
```bash
npx tsx 3-WETTEN/scripts/orchestrator.ts [live|fix|deep-clean]
```

## 📜 Verplichte Richtlijnen
- Managed by **BOB (Grand Visionary)**.
- Follow `000-CURSOR-ARCHITECTURE.mdc`.
