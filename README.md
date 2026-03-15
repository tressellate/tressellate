# Tressellate

**Making Hashgraph Infrastructure AI-Native**

Tressellate is an open-source framework that gives AI agents structured, composable access to [Hiero](https://hiero.org) distributed ledger technology and the [Guardian](https://github.com/hashgraph/guardian) governance engine through the [Model Context Protocol](https://modelcontextprotocol.io).

Just as tiles tessellate to cover any surface without gaps, Tressellate gives AI agents a clean, layered interface to build on Hiero's trust infrastructure.

---

## The Problem

Integrating AI agents with distributed ledger technology is hard. Every new domain — carbon credits, real estate, supply chain — requires building custom API integrations, authentication flows, data schemas, and agent tooling from scratch. This creates massive adoption friction.

## The Solution

Tressellate provides a **5-layer architecture** that separates infrastructure from domain logic, making any Hashgraph-based application instantly consumable by AI agents through MCP.

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Application + Server (WHERE)                          │
│                                                                 │
│  MCP servers that expose domain tools to AI agents.             │
│  Each server is a complete, runnable integration point.         │
│                                                                 │
│  examples/servers/crop-cert/  examples/servers/rec/             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Domain Rules (WHY)                                    │
│                                                                 │
│  Domain-specific configurations, enums, and schemas that        │
│  compose Layer 3 primitives with business constraints.          │
│                                                                 │
│  examples/domains/agriculture/  examples/domains/energy/        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Asset Types (WHAT)                    ┐               │
│                                                 │               │
│  7 universal primitives + 5 operation           │               │
│  factories that model any tokenized asset.      │  Open Source  │
│                                                 │  Apache 2.0   │
│  core/asset-types/                              │               │
├─────────────────────────────────────────────────┤               │
│  Layer 2: Guardian Tools (WHO)                  │               │
│                                                 │               │
│  Identity, governance, and verification         │               │
│  through Hedera Guardian.                       │               │
│                                                 │               │
│  core/guardian-tools/                           │               │
├─────────────────────────────────────────────────┤               │
│  Layer 1: Hashgraph Tools (HOW)                 │               │
│                                                 │               │
│  Infrastructure primitives for Hiero:           │               │
│  accounts, tokens, topics, NFTs, queries.       │               │
│                                                 │               │
│  core/hashgraph-tools/                          ┘               │
└─────────────────────────────────────────────────────────────────┘
```

**Layers 1-3 are open source** — the shared infrastructure anyone can build on.

**Layers 4-5 are where domains plug in** — with 5 complete examples included.

---

## Tressellate vs. Raw SDK: The Operating System for AI-Native Web3

The raw Hiero SDK is analogous to a pile of bricks and mortar. Developers can build anything, but every tokenized asset application requires figuring out structural engineering, plumbing, and electrical wiring from scratch. Tressellate is a structural leap forward:

**1. An Ontology, Not Just Functions**
The raw SDK provides functions like `TokenCreateTransaction`, but it doesn't know what a "Certificate" or a "Milestone" is. Tressellate (Layer 3) provides a semantic ontology of 7 universal primitives that map real-world business concepts directly to ledger mechanics.

**2. Zero-Integration AI Translation**
Building an app with the raw SDK requires a massive "AI Translation" layer—custom APIs, bespoke system prompts, and forcing LLMs to guess JSON payloads. Tressellate *is* the translation layer. Via the Model Context Protocol, AI agents intrinsically understand the tool schemas and validation rules with zero custom training.

**3. State Composability**
Linking a Guardian verifier policy to an NFT minting event requires bespoke orchestration code in the raw SDK. In Tressellate, Guardian operations (Layer 2) and Hashgraph operations (Layer 1) are abstracted so that Domain Rules (Layer 4) can compose them effortlessly.

**4. Instant Enterprise Onboarding**
A developer building a supply chain tracker with the raw SDK might spend 6-8 weeks just on infrastructure plumbing. With Tressellate, they define their `parts-prov` schema in Layer 4, spin up the Layer 5 server, and possess an enterprise-grade, AI-ready tracking system natively executing on Hiero in an afternoon.

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.0+ (or Node.js 18+)
- A Hedera testnet account ([portal.hedera.com](https://portal.hedera.com))

### Installation

```bash
git clone https://github.com/tressellate/tressellate.git
cd tressellate
bun install
bun run build
```

### Run an Example Server

```bash
# Set up environment
export HEDERA_NETWORK=testnet
export HEDERA_OPERATOR_ID=0.0.xxxxx
export HEDERA_OPERATOR_KEY=your-private-key
export HEDERA_SUPPLY_KEY=your-supply-key

# Start the Crop Certificate server
cd examples/servers/crop-cert
bun run dev
```

Then connect any MCP-compatible client (Claude Desktop, Cursor, etc.) and the agent will discover tools like `crop_cert_issue`, `crop_cert_verify`, and `crop_cert_get_audit`.

### Test the MCP Server Connection

You can verify the server is running correctly directly from the terminal using the provided test client:

```bash
cd examples/client
bun install
bun run test-server ../servers/crop-cert/dist/index.js
```

This will connect to the MCP server over stdio and print out all the discovered tools and their descriptions.

---

## Project Structure

```
tressellate/
├── core/                              # Layers 1-3 (shared infrastructure)
│   ├── hashgraph-tools/               # L1: Hiero SDK primitives (19 tools)
│   ├── guardian-tools/                # L2: Guardian governance primitives
│   └── asset-types/                   # L3: 7 schema types + 5 operation factories
│
├── examples/                          # Layers 4-5 (domain implementations)
│   ├── domains/                       # L4: Domain configurations
│   │   ├── agriculture/               #   Crop categories, certification standards
│   │   ├── energy/                    #   Energy sources, verification bodies
│   │   ├── healthcare/                #   Drug classifications, storage conditions
│   │   ├── real-estate/               #   Property types, lease statuses
│   │   └── supply-chain/             #   Material types, quality grades
│   ├── apps/                          # L5: Domain tool packages (26 tools total)
│   │   ├── crop-cert/                 #   Crop yield certificate tools
│   │   ├── lease/                     #   Lease agreement tools
│   │   ├── parts-prov/                #   Parts provenance tools
│   │   ├── rec/                       #   Renewable energy credit tools
│   │   └── drug-cert/                 #   Drug lot certification tools
│   └── servers/                       # L5: MCP stdio servers
│       ├── crop-cert/                 #   Agriculture MCP server
│       ├── lease/                     #   Real estate MCP server
│       ├── parts-prov/                #   Supply chain MCP server
│       ├── rec/                       #   Energy MCP server
│       └── drug-cert/                 #   Healthcare MCP server
│
└── apps/                              # Standalone applications
    └── core-dashboard/                # Admin dashboard
```

---

## Layer 1: Hashgraph Tools (19 tools)

Infrastructure primitives for the Hiero network.

| Category | Tools |
|----------|-------|
| **Tokens** | `hedera_create_token`, `hedera_mint_token`, `hedera_transfer_token`, `hedera_burn_token`, `hedera_associate_token` |
| **NFTs** | `hedera_create_nft_collection`, `hedera_mint_nft`, `hedera_transfer_nft`, `hedera_burn_nft`, `hedera_get_nft_info`, `hedera_get_account_nfts`, `contract_verify_holder` |
| **Accounts** | `hedera_create_account`, `hedera_get_account_info` |
| **Consensus** | `hedera_create_topic`, `hedera_submit_topic_message`, `hedera_get_topic_messages` |
| **Queries** | `hedera_get_token_balance`, `hedera_get_token_info` |

## Layer 3: Asset Type Primitives

**7 Schema Types** that model any tokenized asset:

| Type | Use Case |
|------|----------|
| `CertificateSchema` | Verified attestations (crop yields, drug lots, quality certs) |
| `ProvenanceSchema` | Origin and custody tracking (parts, supply chain steps) |
| `CreditSchema` | Quantifiable units of value (energy credits, carbon offsets) |
| `AgreementSchema` | Multi-party contracts (leases, NDAs, service agreements) |
| `InspectionSchema` | Evaluation results (soil tests, audits, assessments) |
| `MilestoneSchema` | Progress markers (payments, deliverables, phases) |
| `ClaimSchema` | Assertions requiring verification (insurance, warranties) |

**5 Operation Factories** that create reusable tool implementations:

| Factory | Purpose |
|---------|---------|
| `createMintNFTAsset` | Mint NFTs with structured metadata |
| `createMintTokenAsset` | Mint fungible tokens with audit trails |
| `createQueryAuditTrail` | Query consensus topic audit logs |
| `createQueryRecord` | Query NFT/token records via mirror node |
| `createAgreementLifecycle` | Manage grant/revoke lifecycle for agreements |

---

## Examples

Three complete domain implementations are included, each demonstrating the full Layer 4 + Layer 5 pattern:

| Domain | L4 Package | L5 Tools | What It Does |
|--------|-----------|----------|-------------|
| **Real Estate** | `domain-real-estate` | `lease` (5 tools) | Grant lease agreements as NFTs, record payment milestones, verify tenancy |
| **Healthcare** | `domain-healthcare` | `drug-cert` (5 tools) | Certify drug lots with GMP compliance, track cold-chain custody |
| **Logistics** | `domain-supply-chain` | `parts-prov` (5 tools) | Track parts provenance with quality certifications and custody chains |

See the [Implementation Guide](./docs/GUIDE.md) for step-by-step instructions on building your own domain.

---

## Design Principles

**Composability over convenience.** Tools are small, focused, and composable. A high-level workflow is a composition of lower-level tools. This lets AI agents reason about each step independently.

**Deterministic verification.** Every tool that writes data returns verification evidence — transaction IDs, consensus timestamps, audit trail entries. Nothing happens without a provable record on the ledger.

**Fail informatively.** Error messages tell you what went wrong, why, and what to do about it. AI agents need actionable error context to self-correct.

**Future-proof layers.** Upgrades to one layer don't cascade into others. Layer 1 can adopt new Hiero SDK versions without touching Guardian tools. New domains plug in at Layers 4-5 without modifying core infrastructure.

---

## Why MCP Prevents the AI Black Box

As AI agents orchestrate production systems, the gap between intent and execution becomes opaque. An agent reasons internally, proposes an action, and executes it on external infrastructure — but without a structured protocol at the execution boundary, there is no inspectable record of *what* was requested, *why*, or *whether the outcome matched the intent*. For trust-sensitive domains like finance, procurement, and carbon verification, this opacity is unacceptable.

Tressellate solves this at the execution boundary — exactly where opaque reasoning meets real-world action:

**Standardized tool contracts.** MCP isn't loose prompt-based tool calling. It's a client-server protocol with explicit schemas, parameter definitions, and constraints. Agents discover tools dynamically, request them in structured JSON-RPC format, and receive predictable responses. Developers and auditors can inspect exact tool interfaces, inputs/outputs, and invocation logs without diving into a model's internal weights.

**Built-in traceability.** Every MCP interaction is inherently loggable: tool discovery, calls, parameters, results, errors. This creates a machine-readable chain of actions that's far easier to audit than opaque neural activations or scattered custom integrations.

**Ledger-grounded trust.** In vanilla setups, agents call tools and blindly trust responses. Tressellate flips this by grounding high-stakes actions in **on-ledger proofs**: every write, issuance, and verification traces to a Hiero transaction with consensus timestamp and cryptographic signature. Even if the AI agent hallucinates or its generated code has flaws, the final outcome is verifiable against the immutable ledger.

**Independently attestable layers.** The 5-layer design avoids monolithic black boxes. Each layer has deterministic behavior, bounded responsibility, and can be audited independently — PwC verifies L1 hashgraph calls separately from L5 agent tool calls. Transparency compounds: you don't need to understand the entire AI brain to verify a specific action.

**Preventing agentic drift.** Over successive autonomous iterations, AI agents can gradually move system behavior away from intended parameters in ways that are individually small but collectively significant and untraceable. Tressellate's fixed-contract tool interfaces and per-action ledger attestation make drift *detectable by design*, not just in retrospect.

Critically, the LLM's internal reasoning opacity is **irrelevant** in this architecture. The model has no unmediated authority — it can only call tools with defined parameters through the MCP protocol, and every resulting action is validated by deterministic layers below. The LLM proposes; the ledger disposes. You don't need to audit the AI's reasoning when you can audit every action it takes.

This creates a new category of attestable AI infrastructure. Each domain verified on Tressellate strengthens every other domain on the platform — the same methodology PwC applies to procurement governance transfers directly to carbon verification, supply chain, and healthcare at decreasing cost and increasing confidence. Trust compounds with adoption.

---

## Roadmap

- [x] Layer 1: Core Hiero tool coverage (19 tools)
- [x] Layer 3: 7 asset type primitives + 5 operation factories
- [x] Layer 4-5: 3 domain example implementations (Real Estate, Healthcare, Logistics)
- [ ] Layer 1: `hedera_pin_to_ipfs` — standardized off-chain storage with CID formatting
- [ ] Layer 1: Smart Contract Service integration
- [ ] Layer 1: Scheduled transactions
- [ ] Layer 2: `GovernanceProvider` pluggable interface (Guardian or lightweight RBAC)
- [ ] Layer 2: Complete Guardian Standard Registry integration
- [ ] Layer 2: Multi-policy orchestration
- [ ] Layer 3: Schema versioning with `superseded` flag and `resolveLatestVersion`
- [ ] Transport: Streamable HTTP for remote deployment
- [ ] SDK: Python MCP server implementation

---

## Commercial Extensions

Tressellate's open-source core (Layers 1-3) provides the foundation. For production deployments requiring advanced resilience and intelligence capabilities:

- **LNC (Linear Network Coding)** — A Layer 1 resilience upgrade that solves the Dual-Record Pattern vulnerability, where on-chain hashes point to off-chain data that can disappear. LNC uses polynomial proofs and coded packets scattered across network nodes so that data is mathematically reconstructible from any sufficient subset of nodes — no single node holds the complete data, and all data is encrypted before coding. Smart contracts can prove data integrity without exposing content.

- **DCL (Domain Coupled Learning)** — A physics-bounded intelligence layer that sits above Layer 5 as a constraint surface. DCL uses coupling tensors learned from real-world data to enforce physical laws on AI agent actions: an LLM proposes an action, DCL validates it against domain physics, and only physically possible actions execute on-chain. This creates a new asset type — *Validated Physical State* — a hashgraph record proving that AI recommendations were physics-bounded before execution. Protected by Patent Family 5 (24 issued MIMO patents).

### Flagship Commercial Verticals

To prove the enterprise-readiness of the Tressellate architecture, we are launching independent commercial entities and network applications built natively on this MCP:

1. **bulKrete (Verity Test Infrastructure)** — Verified construction materials procurement and heavy infrastructure governance.
2. **dotOS (Hospitality Registry System)** — Agentic workflows and verifiable asset management platform for the hospitality industry.
3. **doqUmint** — Cryptographically secure legal document verification and execution.
4. **reTerra (Bioactive Carbon Bond)** — Asset-backed environmental finance primitives with real-time verification.
5. **konTrax (Infrastructure Contract System)** — Verifiable coordination and project management for Public-Private Partnerships (PPP), managed in partnership with PwC.
6. **solarAnihan (Community Solar Cooperative)** — Community-driven distributed solar energy, battery sharing networks, and prosumer microgrids for the Philippines. Bayanihan-powered energy democracy on-chain.

---

## Contributing

We welcome contributions to the open-source core (Layers 1-3) and new domain examples (Layers 4-5).

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

## License

Layers 1-3 (`core/`) are licensed under the [Apache License 2.0](./LICENSE).

Example implementations (`examples/`) are licensed under [Apache License 2.0](./LICENSE).

---

Built by [bulKrete Technologies](https://bulkrete.com) | [Documentation](./docs/GUIDE.md) | [Architecture](./docs/ARCHITECTURE.md)
