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
9. [Architecture](#%EF%B8%8F-architecture)
10. [How We Built It](#%EF%B8%8F-how-we-built-it)
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
  Step 2 [GPT-4]              → reviewed: added useCallback,
                                memoization, accessibility
                 │
                 ▼
  Step 3 [DeepSeek-Coder]     → optimized, added Jest tests,
                                fixed edge cases

📦 Final deliverable: production-ready component + tests
```

---

## ⚡ Quick Start

### Prerequisites
- [ZCode](https://zcode.dev) installed
- Node.js 18+ (for the MCP server)

### Install the Plugin

**Option A — From this repo (clone & link):**
```bash
git clone https://github.com/roman-ryzenadvanced/fusion-zcode-plugin.git
cd fusion-zcode-plugin/0.1.0
npm install
npm run build
```

Then copy the built plugin into your ZCode plugin cache:
```bash
# Windows (Git Bash)
cp -r . "/c/Users/$USER/.zcode/cli/plugins/cache/zcode-plugins-official/fusion-plugin/0.1.0/"

# macOS / Linux
cp -r . ~/.zcode/cli/plugins/cache/zcode-plugins-official/fusion-plugin/0.1.0/
```

**Option B — Plugin registry (once published):**
```bash
zcode plugin install fusion-plugin
```

### Enable in ZCode

Add this line to `~/.zcode/cli/config.json` under `plugins.enabledPlugins`:
```json
"fusion-plugin@zcode-plugins-official": true
```

Restart ZCode. You should now see the `fusion` skill available. 🎉

### Verify It Works

Ask ZCode something that triggers fusion:
```markdown
"What are the trade-offs between PostgreSQL and MongoDB for a SaaS app?"
```
Fusion should kick in and tell you which mode it selected.

---

## ⚙️ Configuration

Fusion ships with sensible defaults. To customize, set these environment variables (or ZCode user-config values):

| Variable | Default | Purpose |
|----------|---------|---------|
| `FUSION_MODEL_CODING` | `deepseek-coder,gpt-4,claude-3-5-sonnet` | Models for coding tasks |
| `FUSION_MODEL_ANALYSIS` | `o1,o3,claude-3-opus,gpt-4` | Models for reasoning/analysis |
| `FUSION_MODEL_CREATIVE` | `gpt-4,claude-3-5-sonnet,command-r` | Models for creative tasks |
| `FUSION_MODEL_VISION` | `gpt-4-vision,claude-3-opus-vision` | Models for vision tasks |
| `FUSION_API_KEY` | *(empty)* | API key for your model provider |
| `FUSION_API_BASE` | `https://api.openrouter.ai/api/v1` | API base URL |

Example shell profile:
```bash
export FUSION_API_KEY="your-openrouter-key"
export FUSION_MODEL_CODING="deepseek-coder,gpt-4o,claude-3-5-sonnet"
```

---

## 🧪 Usage Examples

### Consensus — Strategic Decisions
```markdown
User: "Should we adopt GraphQL over REST for our new product?"
→ Fusion queries 3 analysis models, synthesizes a balanced recommendation.
```

### Sequential — Feature Builds
```markdown
User: "Design and implement a rate limiter in Node.js, then review it."
→ Pipeline: design (o1) → implement (Claude-3.5) → review (GPT-4).
```

### Specialist — Domain Work
```markdown
User: "Debug this pandas ValueError: ..."
→ Routes to coding specialists (DeepSeek-Coder, GPT-4).
```

### Fallback — Mission Critical
```markdown
User: "Generate production-grade JWT auth middleware. Must not fail."
→ Primary (Claude-3.5) with automatic failover to backups.
```

---

## 🔌 MCP API Reference

When the Fusion MCP server is active, these tools are available to the agent:

### `analyze_task`
Analyzes a task and returns the recommended fusion mode + models.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `task` | string | ✅ | The task text |
| `context` | string | ❌ | Optional extra context |

**Returns:** `{ recommendedMode, recommendedModels, confidence }`

### `execute_fusion`
Executes a multi-model fusion task.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `task` | string | ✅ | The task text |
| `mode` | string | ❌ | Force a mode (consensus/sequential/specialist/fallback) |
| `models` | string[] | ❌ | Override the model list |

### `get_models`
Lists all available models grouped by capability.

---

## 🏗️ Architecture

```
fusion-zcode-plugin/
├── 0.1.0/
│   ├── .zcode-plugin/
│   │   └── plugin.json          # ZCode plugin manifest + user config schema
│   ├── skills/fusion/
│   │   └── SKILL.md             # The fusion skill (auto-routing rules)
│   ├── src/mcp/
│   │   └── server.ts            # MCP server source (analyze/exec/list)
│   ├── package.json             # Dependencies & build scripts
│   └── tsconfig.json            # TypeScript config
├── .github/workflows/
│   └── release.yml              # CI: build + typecheck on push/tag
├── examples/
│   └── consensus-demo.md        # Worked example
├── README.md                    # You are here
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

**Data flow:**
1. User task → ZCode → Fusion skill triggers
2. Skill (or MCP `analyze_task`) classifies the task
3. Appropriate models are engaged per the selected mode
4. Outputs are synthesized into a single response
5. ZCode presents the unified answer to the user

---

## 🛠️ How We Built It

Fusion was designed to feel native to ZCode while bringing OpenRouter's multi-model philosophy on-device. Here's the journey:

1. **Studied the ecosystem** — We explored the existing ZCode plugin cache (`android-emulator`, `skill-creator`, `convex`, etc.) to learn the canonical structure: `.zcode-plugin/plugin.json` manifest, `skills/<name>/SKILL.md`, optional MCP server in `dist/`, and `package.json` for build tooling.

2. **Designed the routing brain** — We mapped common task phrasings ("compare", "build", "debug", "trade-offs") to fusion modes. This became the lightweight classifier in `server.ts`.

3. **Built the MCP server** — Using `@modelcontextprotocol/sdk`, we exposed three tools (`analyze_task`, `execute_fusion`, `get_models`) over stdio transport so any MCP-aware agent can use them.

4. **Wrote the skill** — `SKILL.md` teaches the agent *when* to use Fusion and *how* to fall back to skill-based delegation if the MCP server isn't running.

5. **Kept it secret-free** — All credentials flow through environment variables. The repo contains zero tokens, zero cookies, zero personal data.

6. **Polished for humans** — Visual diagrams, comparison tables, worked examples, and a friendly tone so anyone (human or agent) can replicate the setup.

---

## 🧬 Replicate This Setup

Anyone — human or AI agent — can reproduce this plugin from scratch:

### Step 1 — Scaffold the directory
```bash
mkdir -p fusion-plugin/0.1.0/{.zcode-plugin,skills/fusion,src/mcp}
cd fusion-plugin/0.1.0
```

### Step 2 — Create the manifest (`.zcode-plugin/plugin.json`)
Declare the plugin name, MCP server command, env wiring, and a `userConfig` schema. See [`0.1.0/.zcode-plugin/plugin.json`](./0.1.0/.zcode-plugin/plugin.json) for the full file.

### Step 3 — Write the skill (`skills/fusion/SKILL.md`)
Frontmatter (`name`, `description`) controls when the skill triggers. The body explains the four modes and routing rules. Keep it under 500 lines.

### Step 4 — Implement the MCP server (`src/mcp/server.ts`)
Use `@modelcontextprotocol/sdk` to expose tools over stdio. The classifier reads `FUSION_MODEL_*` env vars and matches task text against pattern lists.

### Step 5 — Build & install
```bash
npm install
npm run build           # outputs dist/mcp/server.js
```
Copy the `0.1.0/` folder into your ZCode plugin cache and enable it in `config.json`.

### Step 6 — Verify
Restart ZCode and trigger the skill with a consensus-style question.

That's it — six steps, fully reproducible. 🎉

---

## 💡 Use Cases

- **Startups deciding architecture** — Get multi-model consensus before betting the company.
- **Teams writing production code** — Fallback mode guarantees a deliverable.
- **Researchers comparing sources** — Consensus mode surfaces disagreements.
- **Devs debugging** — Specialist coding models attack from multiple angles.
- **Content creators** — Creative specialists brainstorm diverse ideas.
- **AI agent builders** — Use Fusion's MCP tools inside your own agent pipelines.

---

## ❓ FAQ

**Does Fusion call the models itself?**
The MCP server plans and classifies. Actual model invocation depends on your provider setup (`FUSION_API_KEY` / `FUSION_API_BASE`). The skill also supports delegation to existing ZCode agents when MCP isn't available.

**Do I need an OpenRouter account?**
No. Any OpenAI-compatible endpoint works — just set `FUSION_API_BASE`.

**Is it free?**
The plugin is MIT-licensed and free. Model provider costs apply per your own API usage.

**Can I add my own models?**
Yes — set any of the `FUSION_MODEL_*` env vars with a comma-separated list.

**Will it work without the MCP server?**
Yes. The skill includes fallback delegation instructions so Fusion still adds value via skill-based routing.

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Fork → branch → commit → PR
2. Run `npm run typecheck` before submitting
3. Never commit secrets — use env vars

---

## 📄 License

[MIT](./LICENSE) © 2026

---

<div align="center">

**⭐ If Fusion makes your ZCode smarter, give the repo a star! ⭐**

Made with ❤️ for the ZCode community

</div>
