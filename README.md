<div align="center">

# 🚀 Fusion — Hybrid Smart Multi-Model AI Orchestration for ZCode

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ZCode Plugin](https://img.shields.io/badge/ZCode-Plugin-6E40C9.svg)](https://zcode.dev)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blueviolet.svg)](https://modelcontextprotocol.io)
[![Version](https://img.shields.io/badge/version-0.1.0-success.svg)](./CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](./CONTRIBUTING.md)

### Let multiple AI models collaborate on a single task — automatically.

**Fusion** brings OpenRouter-style model ensemble routing to [ZCode](https://zcode.dev). It analyzes your task in real time and selects the best fusion strategy: 🤝 Consensus · 🔗 Sequential · 🎯 Specialist · 🛡️ Fallback.

</div>

---

## 📖 Table of Contents

1. [What is Fusion?](#-what-is-fusion)
2. [Why Fusion? (With vs Without)](#-why-fusion-with-vs-without)
3. [The Four Fusion Modes](#-the-four-fusion-modes)
4. [Visual Walkthrough](#-visual-walkthrough)
5. [Quick Start](#-quick-start)
6. [Configuration](#%EF%B8%8F-configuration)
7. [Usage Examples](#-usage-examples)
8. [MCP API Reference](#-mcp-api-reference)
9. [Architecture](#-architecture)
10. [How We Built It](#-how-we-built-it)
11. [Replicate This Setup](#-replicate-this-setup)
12. [Use Cases](#-use-cases)
13. [FAQ](#-faq)
14. [Contributing](#-contributing)
15. [License](#-license)

---

## 🎯 What is Fusion?

**Fusion** is a ZCode plugin that orchestrates *multiple* AI models on a single task. Instead of relying on one model for everything, Fusion dynamically selects and combines models based on what the task actually needs.

Inspired by [OpenRouter's Fusion](https://openrouter.ai), Fusion brings the same multi-model intelligence directly into your coding agent — so the right models collaborate on the right parts of your work.

**In one sentence:** *Fusion reads your task, picks the best model combination, and synthesizes their outputs into one better answer.*

### Key Capabilities

- 🧠 **Auto task analysis** — Detects complexity, domain, and reliability needs
- 🔀 **Four fusion strategies** — Consensus, Sequential, Specialist, Fallback
- 🔌 **MCP server included** — Exposes `analyze_task`, `execute_fusion`, `get_models`
- 🧩 **Skill-based fallback** — Works even without the MCP server running
- ⚙️ **Fully configurable** — Bring your own models via env vars
- 🔐 **Zero secrets in code** — All credentials via environment variables

---

## 🆚 Why Fusion? (With vs Without)

| Scenario | 😩 Without Fusion | 🚀 With Fusion |
|----------|------------------|----------------|
| **Architecture decision** | One model's opinion, no cross-check | 3 models reach consensus, disagreements surfaced |
| **Multi-step feature build** | Manual handoffs, lost context | Automatic pipeline: design → code → review |
| **Debugging a tricky bug** | Stuck with one model's blind spots | Coding specialists attack from multiple angles |
| **Production-critical code** | Hope the single model gets it right | Fallback chain guarantees a result |
| **Cost optimization** | Always uses the most expensive model | Right-sized model per subtask |
| **Creative brainstorming** | Single creative voice | Diverse models, richer ideas |
| **Research / analysis** | One source of reasoning | Multi-perspective synthesis |

> **The bottom line:** Fusion trades a little latency for a lot more reliability, breadth, and quality.

---

## 🌈 The Four Fusion Modes

Fusion picks one of four strategies automatically. You can also force a mode if you prefer.

### 🤝 1. Consensus Mode
> *“Many minds are better than one.”*

- **Trigger words:** `compare`, `evaluate`, `trade-offs`, `pros/cons`, `should we`, `perspectives`
- **Models:** Analysis specialists (o1, o3, Claude-3-Opus, GPT-4)
- **How:** Queries 2–3 models in parallel, then synthesizes agreement and surfaces disagreements.

### 🔗 2. Sequential Mode
> *“Think it, build it, review it.”*

- **Trigger words:** `build`, `implement`, `create`, `then`, `step`, `first`, `next`
- **Models:** Pipelined — reasoning → coding → review
- **How:** Each model refines the previous one's output (e.g., design → implement → critique).

### 🎯 3. Specialist Mode
> *“Right tool for the job.”*

- **Coding triggers:** `code`, `function`, `script`, `debug`, `bug`, `python`, `react`, `api`
- **Analysis triggers:** `analyze`, `research`, `explain`, `architecture`, `strategy`
- **Creative triggers:** `creative`, `brainstorm`, `write`, `design`, `idea`, `tagline`
- **How:** Routes to the domain-optimized model pool.

### 🛡️ 4. Fallback Mode
> *“Never let the user down.”*

- **Trigger:** Reliability-critical tasks, or when no other pattern matches
- **How:** Tries the primary model; on failure/timeout, automatically moves to backups.

---

## 🎬 Visual Walkthrough

### Flow Diagram

```
                        ┌──────────────────────┐
                        │   User gives a task   │
                        └──────────┬───────────┘
                                   ▼
                        ┌──────────────────────┐
                        │  Fusion Skill loads   │
                        │  & analyzes the task  │
                        └──────────┬───────────┘
                                   ▼
              ┌────────────────────┴────────────────────┐
              ▼              ▼              ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Consensus│  │Sequential│  │Specialist│  │ Fallback │
        │   Mode   │  │   Mode   │  │   Mode   │  │   Mode   │
        └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
             │              │              │             │
             └──────────────┴──────┬──────┴─────────────┘
                                   ▼
                        ┌──────────────────────┐
                        │  Synthesize outputs   │
                        │  into one final answer│
                        └──────────┬───────────┘
                                   ▼
                        ┌──────────────────────┐
                        │  Optimized response   │
                        └──────────────────────┘
```

### Example: Consensus Mode in Action

```
User: "What are the trade-offs of microservices vs monolith for a startup?"

🔍 Fusion analysis:
   → Detected: "trade-offs"  →  Mode: CONSENSUS  →  Confidence: 0.8
   → Models engaged: o1, Claude-3-Opus, GPT-4

┌─ o1 ────────────────────────────────────────────────┐
│ Start with a modular monolith. Microservices add    │
│ operational overhead that early startups can't      │
│ afford. Plan for extraction later.                  │
└─────────────────────────────────────────────────────┘

┌─ Claude-3-Opus ─────────────────────────────────────┐
│ Microservices solve team-scaling, not technical     │
│ scaling. Under 10 engineers? Monolith wins. Use     │
│ hexagonal architecture for easy future extraction.  │
└─────────────────────────────────────────────────────┘

┌─ GPT-4 ─────────────────────────────────────────────┐
│ Monolith: simpler debugging, single deploy artifact,│
│ shared DB transactions, lower infra cost. Clear win │
│ for startups.                                       │
└─────────────────────────────────────────────────────┘

🤝 Fusion synthesis:
   ✅ Agreement: Start monolith, design for extraction
   🔀 Nuance: Hexagonal architecture as the bridge
   📋 Recommendation: Modular monolith → extract at 10+ engineers
```

### Example: Sequential Mode in Action

```
User: "Build a React todo component and write unit tests"

🔍 Fusion analysis:
   → Detected: multi-step ("build" + "and" + "tests")
   → Mode: SEQUENTIAL  →  Confidence: 0.75

  Step 1 [Claude-3.5-Sonnet]  → drafted TodoList.jsx
                 │
                 ▼
  Step 2 [GPT-4] 
