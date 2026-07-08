# Architecture

This document explains how Fusion is structured and how data flows through it.

## High-Level Diagram

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│   ZCode UI   │────▶│  Fusion Skill │────▶│  Task Classifier│
└──────────────┘     └──────┬───────┘     └────────┬────────┘
                            │                       │
                            ▼                       ▼
                     ┌──────────────┐     ┌─────────────────┐
                     │  MCP Server  │◀───▶│  Model Pools    │
                     │  (optional)  │     │ (env-configured)│
                     └──────┬───────┘     └────────┬────────┘
                            │                       │
                            └───────────┬───────────┘
                                        ▼
                             ┌─────────────────────┐
                             │  Synthesis Engine   │
                             └─────────┬───────────┘
                                       ▼
                             ┌─────────────────────┐
                             │  Unified Response   │
                             └─────────────────────┘
```

## Components

### 1. Skill (`skills/fusion/SKILL.md`)
The entry point. Its frontmatter (`name`, `description`) tells ZCode when to
load it. The body explains the four fusion modes and the routing heuristics.

### 2. Plugin Manifest (`0.1.0/.zcode-plugin/plugin.json`)
Declares:
- Plugin name and version
- The MCP server command + args
- Environment variable wiring (`FUSION_MODEL_*`, `FUSION_API_*`)
- A `userConfig` schema so ZCode can surface settings in its UI

### 3. MCP Server (`0.1.0/src/mcp/server.ts`)
A stdio-based MCP server exposing three tools:
- `analyze_task` — classifies the task → mode + models
- `execute_fusion` — orchestrates a multi-model run
- `get_models` — lists configured model pools

The classifier matches the task text against pattern lists
(`CONSENSUS_PATTERNS`, `SEQUENTIAL_PATTERNS`, `CODING_PATTERNS`, etc.) and
returns a confidence score.

### 4. Model Pools (env-configured)
Models are grouped by capability and loaded from environment variables at
startup. This keeps credentials out of the codebase entirely.

## Design Principles

1. **Secret-free** — zero hardcoded credentials; everything via env vars.
2. **Graceful degradation** — works with skill-based delegation if MCP is down.
3. **Convention over configuration** — sensible defaults; override only what you need.
4. **Composable** — each component has a single responsibility.
