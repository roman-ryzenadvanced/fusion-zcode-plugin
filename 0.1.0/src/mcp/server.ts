import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Configuration from environment
const config = {
  codingModels: process.env.FUSION_MODEL_CODING?.split(",") || ["deepseek-coder", "gpt-4", "claude-3-5-sonnet"],
  analysisModels: process.env.FUSION_MODEL_ANALYSIS?.split(",") || ["o1", "o3", "claude-3-opus", "gpt-4"],
  creativeModels: process.env.FUSION_MODEL_CREATIVE?.split(",") || ["gpt-4", "claude-3-5-sonnet", "command-r"],
  visionModels: process.env.FUSION_MODEL_VISION?.split(",") || ["gpt-4-vision", "claude-3-opus-vision"],
  apiKey: process.env.FUSION_API_KEY || "",
  apiBase: process.env.FUSION_API_BASE || "https://api.openrouter.ai/api/v1"
};

// Selection strategies:
//   "auto"  — agent/classifier picks the models (default)
//   "user"  — use EXACTLY the models the caller passed in `models`, no overrides
type SelectionStrategy = "auto" | "user";

// Resolve which models to use given the strategy and optional user picks.
// - auto:  run the classifier, but honor explicit user models if provided
// - user:  trust the caller's `models` list verbatim; if none given, fall back to auto
function resolveExecution(
  task: string,
  strategy: SelectionStrategy,
  modeHint: string | undefined,
  userModels: string[] | undefined
): { mode: string; models: string[]; confidence: number; strategy: SelectionStrategy; source: string } {
  // User strategy with an explicit model list = trust the caller completely
  if (strategy === "user" && userModels && userModels.length > 0) {
    // Still let the classifier suggest a mode so the agent knows how to run them,
    // unless the caller also forced a mode.
    const mode = modeHint || analyzeTask(task).mode;
    return { mode, models: userModels, confidence: 1.0, strategy: "user", source: "user-specified" };
  }

  // Auto strategy (or user strategy without a model list): classify + assign
  const analysis = analyzeTask(task);
  const mode = modeHint || analysis.mode;
  // If the user passed models under auto, prefer them over the classifier's pick
  const models = (userModels && userModels.length > 0) ? userModels : analysis.models;
  return {
    mode,
    models,
    confidence: userModels && userModels.length > 0 ? 0.95 : analysis.confidence,
    strategy: "auto",
    source: userModels && userModels.length > 0 ? "user-overridden-with-auto-mode" : "auto-classified",
  };
}

// Task analysis patterns
const CONSENSUS_PATTERNS = ["compare", "evaluate", "trade-off", "pros/cons", "perspective", "what are the", "should we", "advantages", "disadvantages"];
const SEQUENTIAL_PATTERNS = ["build", "implement", "create", "then", "step", "first", "next", "and then", "refactor", "write", "test", "review"];
const SEQUENTIAL_CONJUNCTIONS = [" and ", " then ", " next ", " first ", " after that ", " finally "];
const CODING_PATTERNS = ["code", "function", "script", "debug", "bug", "error", "implement", "python", "react", "api", "component", "class"];
const ANALYSIS_PATTERNS = ["analyze", "research", "explain", "architecture", "design", "strategy", "review", "audit"];
const CREATIVE_PATTERNS = ["creative", "brainstorm", "write", "design", "idea", "original", "story", "poem", "tagline"];

function analyzeTask(task: string): { mode: string; models: string[]; confidence: number } {
  const taskLower = task.toLowerCase();

  // 1. Consensus: multi-perspective reasoning (highest priority for decision tasks)
  if (CONSENSUS_PATTERNS.some(p => taskLower.includes(p))) {
    return { mode: "consensus", models: config.analysisModels.slice(0, 3), confidence: 0.8 };
  }

  // 2. Sequential: multi-step tasks. Trigger when >=2 action verbs OR
  //    (>=1 action verb AND a conjunction chaining steps like "X and Y").
  //    This must run BEFORE the specialist checks so that a task which is
  //    both coding AND multi-step pipelines instead of routing to one model.
  const seqVerbHits = SEQUENTIAL_PATTERNS.filter(p => taskLower.includes(p));
  const hasConjunction = SEQUENTIAL_CONJUNCTIONS.some(c => taskLower.includes(c));
  const isMultiStep = seqVerbHits.length >= 2 || (seqVerbHits.length >= 1 && hasConjunction);
  if (isMultiStep) {
    return { mode: "sequential", models: [...config.analysisModels.slice(0, 1), ...config.codingModels.slice(0, 2)], confidence: 0.75 };
  }

  // 3. Specialist: single-domain routing
  for (const pattern of CODING_PATTERNS) {
    if (taskLower.match(new RegExp(pattern, "i"))) {
      return { mode: "specialist", models: config.codingModels, confidence: 0.9 };
    }
  }

  for (const pattern of ANALYSIS_PATTERNS) {
    if (taskLower.includes(pattern)) {
      return { mode: "specialist", models: config.analysisModels, confidence: 0.75 };
    }
  }

  for (const pattern of CREATIVE_PATTERNS) {
    if (taskLower.includes(pattern)) {
      return { mode: "specialist", models: config.creativeModels, confidence: 0.7 };
    }
  }

  // 4. Fallback: nothing matched, prioritize reliability
  return { mode: "fallback", models: [config.analysisModels[0]], confidence: 0.5 };
}

const server = new Server(
  {
    name: "fusion-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_task",
      description: "Analyze a task to determine optimal fusion mode and model selection",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "The task to analyze" },
          context: { type: "string", description: "Optional context for analysis" }
        },
        required: ["task"]
      }
    },
    {
      name: "execute_fusion",
      description: "Execute a multi-model fusion task. Use selection_strategy='auto' to let the agent pick models, or 'user' to force the exact models passed in `models`.",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "The task to execute" },
          mode: { type: "string", description: "Fusion mode: consensus, sequential, specialist, or fallback (auto-detected if not specified)" },
          models: { type: "array", items: { type: "string" }, description: "Specific models to use. Required when selection_strategy='user'." },
          selection_strategy: { type: "string", enum: ["auto", "user"], description: "'auto' = agent picks models (default). 'user' = use exactly the models in `models`, no overrides." }
        },
        required: ["task"]
      }
    },
    {
      name: "get_models",
      description: "Get available models for each capability. Use this to show the user what models they can pick from.",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "analyze_task": {
      const task = request.params.arguments?.task as string || "";
      const context = request.params.arguments?.context as string | undefined;
      const result = analyzeTask(task);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              task,
              recommendedMode: result.mode,
              recommendedModels: result.models,
              confidence: result.confidence,
              context: context || null
            }, null, 2)
          }
        ]
      };
    }
    
    case "execute_fusion": {
      const task = request.params.arguments?.task as string || "";
      const modeHint = request.params.arguments?.mode as string | undefined;
      const models = request.params.arguments?.models as string[] | undefined;
      const strategy = (request.params.arguments?.selection_strategy as SelectionStrategy) || "auto";

      const result = resolveExecution(task, strategy, modeHint, models);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              task,
              mode: result.mode,
              models: result.models,
              selection_strategy: result.strategy,
              model_source: result.source,
              confidence: result.confidence,
              status: "planned",
              message:
                result.strategy === "user"
                  ? `Using USER-SPECIFIED models (${result.models.join(", ")}) in ${result.mode} mode. The agent will not override your choice.`
                  : models && models.length > 0
                    ? `Auto mode with user model preference (${result.models.join(", ")}). Mode auto-detected as ${result.mode}.`
                    : `Auto-selected ${result.mode} mode with models: ${result.models.join(", ")}.`
            }, null, 2)
          }
        ]
      };
    }

    case "get_models": {
      // Return a richer view so the user can make an informed choice.
      const capabilities = {
        coding: { models: config.codingModels, use_for: "Code generation, debugging, refactoring, implementation" },
        analysis: { models: config.analysisModels, use_for: "Reasoning, comparison, research, architecture decisions" },
        creative: { models: config.creativeModels, use_for: "Writing, brainstorming, taglines, content" },
        vision: { models: config.visionModels, use_for: "Image understanding, OCR, visual QA" },
        hint: "To let the user choose, show them these pools and call execute_fusion with selection_strategy='user' and their chosen models in the `models` array.",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(capabilities, null, 2)
          }
        ]
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fusion MCP server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
