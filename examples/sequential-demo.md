# Sequential Mode Demo

This document walks through a complete example of Fusion's **Sequential Mode**.

## User Query

> "Build a React todo component with unit tests"

## Fusion Analysis

```
Task Analysis:
- Keywords detected: "build" (x2), "and", "tests"
- Multi-step signal: YES (>=2 sequential triggers)
- Mode selected: SEQUENTIAL
- Models: Claude-3-5-Sonnet → GPT-4 → DeepSeek-Coder
- Confidence: 0.75
```

## Pipeline Execution

### Step 1 — Draft (Claude-3.5-Sonnet)
Generates the initial `TodoList.jsx` component with:
- Basic state management
- Add/remove todo functionality
- Simple styling

### Step 2 — Review (GPT-4)
Reviews the draft and adds:
- `useCallback` for stable function references
- `React.memo` to prevent unnecessary re-renders
- ARIA labels for accessibility
- TypeScript-friendly prop types

### Step 3 — Optimize (DeepSeek-Coder)
Final pass adds:
- Jest unit tests (4 test cases)
- Edge case handling (empty list, duplicate entries)
- Performance micro-optimizations

## Final Deliverable

```
📦 Output:
├── TodoList.jsx       (production-ready, accessible, memoized)
├── TodoList.test.jsx  (4 Jest tests, 100% coverage of core logic)
└── README.md          (component API + usage examples)
```

## Why Sequential Mode Worked Here

This task has clear phases (create → review → test) where each model's strength
amplifies the others. A single model would miss the review and testing depth
that the pipeline provides.
