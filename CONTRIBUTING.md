# Contributing to Trellis MCP

Thank you for your interest in contributing to Trellis MCP. This project provides open-source MCP tools for Hiero (Layer 1) and Guardian (Layer 2). Contributions to these layers are welcome and encouraged.

## Scope of Contributions

**In scope:** Layers 1 and 2 — hashgraph-tools and guardian-tools packages. These are the open-source infrastructure layers that the community builds on.

**Also welcome:** New domain examples at Layers 4-5 in the `examples/` directory that demonstrate how to build on the core infrastructure.

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the test suite (`bun test`)
5. Verify build (`bun run build`)
6. Commit your changes (`git commit -m 'Add: description of change'`)
7. Push to your branch (`git push origin feature/your-feature`)
8. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/trellis-mcp/trellis-mcp.git
cd trellis-mcp
bun install
bun run build
bun test
```

## Code Standards

- **TypeScript** for all source code
- **Strict typing** — no `any` types without justification
- **Descriptive tool names** — follow the `hedera_` and `guardian_` prefix conventions
- **Actionable error messages** — every error should tell the caller what went wrong and what to try
- **Deterministic outputs** — every write operation returns verification evidence (transaction IDs, trust chain references)

## Commit Convention

Use clear, descriptive commit messages:

- `Add: new tool for scheduled transactions`
- `Fix: error handling in topic message retrieval`
- `Docs: update Layer 2 tool descriptions`
- `Test: add coverage for token operations`
- `Refactor: simplify Guardian authentication flow`

## Pull Request Guidelines

- One feature or fix per PR
- Include tests for new tools
- Update documentation if tool interfaces change
- Describe the use case — why does this tool exist?
- Reference any related Hiero or Guardian documentation

## Layer Architecture Rules

When contributing, maintain the layer separation:

- **Layer 1 tools** (`core/hashgraph-tools/`) must only interact with Hiero network APIs. They must not import or depend on Guardian tools.
- **Layer 2 tools** (`core/guardian-tools/`) may call Layer 1 tools for ledger operations. They must not contain domain-specific logic.
- **Layer 3** (`core/asset-types/`) provides schemas and operation factories. No domain-specific logic.
- **Layer 4** (`examples/domains/`) contains domain configuration, enums, and schemas only.
- **Layer 5 tools** (`examples/apps/`, `examples/servers/`) compose all lower layers. They should demonstrate clean composition patterns.

## Questions?

Open an issue with the `question` label. We're happy to help contributors find the right approach.

---

*Building the trellis together.*
