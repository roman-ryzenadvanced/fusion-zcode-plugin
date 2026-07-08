# Changelog

All notable changes to the Fusion plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-09

### Added
- Initial release of Fusion plugin
- Four fusion modes: Consensus, Sequential, Specialist, Fallback
- Automatic task analysis and mode selection
- MCP server with three tools:
  - `analyze_task` - Task classification
  - `execute_fusion` - Multi-model execution
  - `get_models` - Model capability listing
- Skill-based delegation for non-MCP environments

### Security
- No hardcoded API keys or secrets in codebase
- Environment-based configuration only
- Secure MCP server implementation
