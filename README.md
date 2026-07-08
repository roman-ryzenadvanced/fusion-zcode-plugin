# Fusion Plugin

A ZCode plugin for hybrid smart model fusion with auto-shifting between consensus, sequential, specialist, and fallback modes.

## Features

- **Auto-detecting Mode Selection**: Analyzes tasks and automatically selects the optimal fusion strategy
- **Four Fusion Modes**:
  - **Consensus**: Multi-model agreement on complex reasoning tasks
  - **Sequential**: Pipeline models for iterative refinement
  - **Specialist**: Route to domain-optimized models
  - **Fallback**: Reliable execution with automatic failover

## Installation

1. Install the plugin:
```bash
zcode plugin install fusion-plugin
```

2. Configure model endpoints (optional):
```bash
# Add to your ZCode config
FUSION_MODEL_CODING="deepseek-coder,gpt-4,claude-3-5-sonnet"
FUSION_MODEL_ANALYSIS="o1,o3,claude-3-opus,gpt-4"
FUSION_API_KEY="your-api-key"
```

## Usage Examples

**Multi-model consensus**: "What are the trade-offs between microservices and monoliths?"

**Sequential pipeline**: "Build a React component and write unit tests"

**Specialist routing**: "Debug this Python error: ..."

**Fallback mode**: "Generate production-ready authentication middleware"

## MCP Tools

- `analyze_task(task, context?)` - Determine optimal fusion mode
- `execute_fusion(task, mode?, models?)` - Execute multi-model task
- `get_models()` - List available models by capability

## License

MIT
