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
      description: "Execute a multi-model fusion task with automatic synthesis",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "The task to execute" },
          mode: { type: "string", description: "Fusion mode (auto-detected if not specified)" },
          models: { type: "array", items: { type: "string" }, description: "Models to use" }
        },
        required: ["task"]
      }
    },
    {
      name: "get_models",
      description: "Get available models for each capability",
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
      const mode = request.params.arguments?.mode as string | undefined;
      const models = request.params.arguments?.models as string[] | undefined;
      
      const analysis = mode 
        ? { mode, models: models || [] }
        : analyzeTask(task);
      
      const modelsToUse = models || analysis.models;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              task,
              mode: analysis.mode,
              models: modelsToUse,
              status: "planned",
              message: `Ready to execute ${analysis.mode} fusion with ${modelsToUse.length} model(s). Configure API endpoints via FUSION_API_KEY and FUSION_API_BASE environment variables.`
            }, null, 2)
          }
        ]
      };
    }
    
    case "get_models": {
      const capabilities = {
        coding: config.codingModels,
        analysis: config.analysisModels,
        creative: config.creativeModels,
        vision: config.visionModels
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
