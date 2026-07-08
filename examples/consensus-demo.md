# Consensus Mode Demo

This document walks through a complete example of Fusion's **Consensus Mode**.

## User Query

> "What are the trade-offs between microservices and monolithic architecture for a startup?"

## Fusion Analysis

```
Task Analysis:
- Keywords detected: "trade-offs", "what are"
- Mode selected: CONSENSUS
- Models: o1, claude-3-opus, gpt-4
- Confidence: 0.8
```

## Model Responses

### o1 (Reasoning Model)
> For startups, I recommend starting with a modular monolith. The operational overhead of microservices is significant — you need containerization, orchestration, monitoring, and distributed system expertise. At early stages, speed of iteration and simple deployments matter more than horizontal scaling.

### Claude-3-Opus (Analysis Model)
> Microservices shine when you have team scaling issues. However, for <10 engineers, a monolith with clear module boundaries is superior. The key is designing for eventual extraction — use hexagonal architecture patterns so services can be carved out later without a rewrite.

### GPT-4 (General Model)
> Both approaches work, but monolith wins for startups due to:
> 1. Simpler debugging and testing
> 2. Single deployment artifact
> 3. Shared database transactions
> 4. Lower infrastructure costs
> Extract services only when a specific scaling pain demands it.

## Fusion Synthesis

**🤝 Consensus Summary:**
All three models agree: **start with a monolith, plan for extraction**.

**🔍 Key Insights:**
- Operational complexity is the #1 startup killer
- Team size <10 engineers strongly favors monolith
- Modular boundaries enable future migration

**📝 Recommended Path:**
1. Build modular monolith with hexagonal architecture
2. Extract services when team reaches 10+ engineers
3. Use event-driven patterns for loose coupling
