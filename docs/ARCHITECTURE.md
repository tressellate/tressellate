# Tressellate Framework Architecture

## A Universal Asset Registry with Agentic Orchestration

**Version:** 3.0 (Five-Layer Architecture)
**Status:** Proposal for Review
**Date:** March 2026
**Authors:** Arnold Alagar

---

## 1. Executive Summary

Tressellate is an open-source framework that enables any business asset — documents, credentials, certificates, currencies, access rights — to be registered, verified, and operated on through a distributed ledger, with AI agents orchestrating the workflows.

The framework provides a five-layer composable architecture built on Hiero (the distributed ledger technology under the Linux Foundation Decentralized Trust, powering the Hedera network) and Guardian (a governance framework for policy-driven verification). Each layer is independent, typed, and serves a distinct purpose.

The core thesis: **the verification infrastructure (how things are recorded), the governance model (who can do what), the asset type (what is being registered), the domain context (the business rules), and the application workflows (concrete deployable implementations) are orthogonal concerns that should never be conflated.**

This document describes the architecture in sufficient detail for critical review of its taxonomy, composability model, and extensibility claims.

---

## 2. The Problem

### 2.1 Current State

Most Web3 integrations produce monolithic applications that tightly couple:

- Ledger operations (creating tokens, submitting messages)
- Governance logic (who is authorized, what policies apply)
- Asset definitions (what a "certificate" or "provenance record" looks like)
- Domain rules (industry-specific validation, compliance requirements)

This coupling means that a carbon credit verification system shares no code or patterns with a construction compliance system, even though both create certificates, track provenance, issue credits, and maintain audit trails.

### 2.2 The Observation

When we built four domain implementations (climate finance, hospitality loyalty, industrial compliance, and access control), we discovered that **the same asset type patterns kept reappearing across domains**:

| Pattern | Climate Finance (BCB) | Construction (ICS) | Legal (NDA) | Hospitality (Hours) |
|---------|----------------------|--------------------| ------------|---------------------|
| Certificate | TerraPrimaCert | BatchCert | — | — |
| Provenance Record | BiocharProv | MatProv | — | — |
| Credit/Currency | SoilCarbon | CarbonCredit | — | Hours |
| Access Agreement | — | — | NDA | — |
| Inspection Record | — | Inspect | — | — |
| Milestone Record | FarmDeployment | Milestone | — | — |

Certificates, provenance records, and carbon credits appear in multiple domains with nearly identical structural patterns but different field names and validation rules. This suggested a missing abstraction layer.

### 2.3 The Deeper Question: Asset vs. Transaction

To build a universal framework, we needed to resolve a fundamental ontological question: **Is a document an asset or a transaction?**

A document is an **asset** — it's a thing with state, ownership, and a lifecycle (DRAFT → ISSUED → ACTIVE → EXPIRED → REVOKED). The act of registering, signing, verifying, or revoking it is a **transaction** — an event that changes the asset's state.

This distinction matters because:

- **Assets** have inherent structural properties regardless of domain (a certificate has content, an issuer, a date, and an expiration whether it's a soil amendment cert or a medical license)
- **Transactions** are operations on assets that produce verifiable evidence (minting, transferring, burning on the ledger)
- **Domains** add validation rules, required fields, and business logic on top of the structural properties

Therefore: **asset type defines the noun (what it is), domain defines the adjective and verb (what rules apply and what operations are valid).**

---

## 3. The Five-Layer Architecture

### 3.1 Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Layer 5: Application Workflows                             │
│   (WHERE — concrete deployable implementations)              │
│                                                              │
│   MCP tool definitions, multi-step workflows, server         │
│   composition, and deployment configuration.                 │
│                                                              │
│   Packages: @tressellate/crop-cert, @tressellate/lease,      │
│   @tressellate/parts-prov, @tressellate/rec,                │
│   @tressellate/drug-cert                                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Layer 4: Domain Rules                                      │
│   (WHY — business context, schemas, and validation)          │
│                                                              │
│   Domain-specific schemas, enums, validation rules,          │
│   and configuration. Shared across applications within       │
│   the same domain.                                           │
│                                                              │
│   Packages: @tressellate/domain-agriculture,                 │
│   @tressellate/domain-energy, @tressellate/domain-healthcare,│
│   @tressellate/domain-real-estate,                           │
│   @tressellate/domain-supply-chain                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Layer 3: Asset Type Patterns                               │
│   (WHAT — the thing being registered)                        │
│                                                              │
│   Reusable, domain-agnostic asset definitions with           │
│   inherent lifecycle, schema shape, and verification         │
│   rules. An asset type works the same way regardless         │
│   of which domain uses it.                                   │
│                                                              │
│   Package: @tressellate/asset-types                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Layer 2: Governance Primitives (Guardian)                   │
│   (WHO — trust, authorization, and policy)                   │
│                                                              │
│   Policy creation, schema management, Verifiable             │
│   Credential lifecycle, dMRV workflows, role                 │
│   assignment, and audit trail management.                    │
│                                                              │
│   Package: @tressellate/guardian-tools                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Layer 1: Ledger Infrastructure (Hashgraph)                 │
│   (HOW — the immutable record)                               │
│                                                              │
│   Account management, consensus messaging, token             │
│   operations, NFT management, and mirror node queries.       │
│   Stateless wrappers around Hiero SDK operations.            │
│                                                              │
│   Package: @tressellate/core                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Layer Composition Direction

Layers compose upward. Each layer calls the layer(s) below it and adds its own semantics:

```
Layer 5 calls Layer 4+3: "Certify this volcanic ash batch via the ics_certify_batch MCP tool"
  │
  └→ Layer 4 provides: domain schemas (BatchCertSchema), enums (AshSource), validation rules
       │
       └→ Layer 3 calls Layer 2: "Create a certificate with these signers, this content hash, this expiration"
            │
            └→ Layer 2 calls Layer 1: "Mint an NFT with this metadata, submit this audit message"
                 │
                 └→ Layer 1 calls Hiero: "HTS mintToken, HCS submitMessage"
```

Each layer can also be used independently:

- Layer 1 alone: direct Hiero operations (any generic DLT use case)
- Layer 2 alone: governance workflows without domain specifics
- Layer 3 alone: asset type management without industry context
- Layer 4 alone: domain schemas and validation without application specifics
- Layer 5: full application workflow with all layers composed

### 3.3 The Key Insight: Orthogonal Dimensions

Asset types and domains are not hierarchical — they are orthogonal. Any asset type can appear in any domain:

```
                     Domains (Layer 4) × Applications (Layer 5)
                 Construction  Hospitality  Climate   Legal   Healthcare
               ┌──────────────┬───────────┬─────────┬───────┬──────────┐
  Certificate  │ BatchCert    │           │TerraPri │       │ License  │
               │ PourAuth     │           │         │       │          │
               ├──────────────┼───────────┼─────────┼───────┼──────────┤
  Provenance   │ MatProv      │           │Biochar  │       │ ChainOf  │
  Record       │              │           │Prov     │       │ Custody  │
               ├──────────────┼───────────┼─────────┼───────┼──────────┤
  Credit /     │ CarbonCredit │ Hours     │SoilCarb │       │          │
  Currency     │              │           │         │       │          │
               ├──────────────┼───────────┼─────────┼───────┼──────────┤
  Agreement    │              │           │         │ NDA   │ Consent  │
               │              │           │         │       │ Form     │
A              ├──────────────┼───────────┼─────────┼───────┼──────────┤
s  Inspection  │ QA Inspect   │ Health    │ Field   │       │ Clinical │
s              │              │ Inspect   │ Verify  │       │ Audit    │
e              ├──────────────┼───────────┼─────────┼───────┼──────────┤
t  Milestone   │ ProjectMS    │           │FarmDep  │       │ Trial    │
               │              │           │         │       │ Phase    │
T              ├──────────────┼───────────┼─────────┼───────┼──────────┤
y  Disbursement│ PayRelease   │           │         │       │ Claim    │
p              │              │           │         │       │ Payout   │
e              └──────────────┴───────────┴─────────┴───────┴──────────┘
s
(Layer 3)
```

The intersection cell represents a Layer 5 application tool — e.g., `ics_certify_batch` — that composes the structural pattern from Layer 3 (what a certificate IS) with domain rules from Layer 4 (what THIS certificate REQUIRES) into a concrete MCP tool.

**Architectural Decision:** Layer 4 domains **compose** Layer 3 asset types via extension, not inheritance. A `BatchCertSchema` extends `CertificateSchema` with construction-specific fields. Layer 5 application tools then wire these composed schemas into MCP tool definitions with input schemas, validation, and multi-step workflows.

**Key separation:** Multiple Layer 5 applications can share the same Layer 4 domain. For example, both BCB and a future REDD+ application compose `@tressellate/domain-climate-finance`. The domain defines the shared language; the application defines the concrete deployment.

---

## 4. Layer Specifications

### 4.1 Layer 1: Ledger Infrastructure

**Package:** `@tressellate/core`
**Dependency:** Hiero SDK only
**Responsibility:** Direct interaction with the Hiero network

Layer 1 provides stateless wrappers around Hiero's native services with MCP-compatible interfaces, structured error handling, and verification evidence in every response.

#### Services

| Service | Operations | Purpose |
|---------|-----------|---------|
| Token Service (HTS) | createToken, mintToken, transferToken, burnToken, associateToken | Fungible token lifecycle |
| NFT Service (HTS) | createNFTCollection, mintNFT, transferNFT, burnNFT, getNFTInfo | Non-fungible token lifecycle |
| Consensus Service (HCS) | createTopic, submitTopicMessage, getTopicMessages | Immutable audit trails |
| Crypto Service | createAccount, getAccountInfo | Account management |
| Mirror Node | getTokenBalance, getTokenInfo, getTransactionReceipt, getTokenTransactionHistory | Historical queries |

#### The Dual-Record Pattern

**Architectural Decision:** Both independent reviewers identified Hiero's 100-byte NFT metadata limit as a hard constraint that the architecture must address structurally, not as a risk to mitigate. Tressellate adopts the **Dual-Record Pattern**: on-chain records store only content identifiers (hashes or CIDs), while structured content lives in off-chain storage (IPFS, Arweave, or application databases). Layer 1 provides the primitives for both.

```
On-Chain (Hiero NFT metadata, ≤100 bytes):
  - contentCID: string         (IPFS/Arweave content identifier)
  - schemaVersion: string      (e.g., "certificate/v1.0")
  - contentHash: string        (SHA-256 of the full content — integrity check)

Off-Chain (IPFS / Arweave / Application DB):
  - Full structured JSON matching the Layer 3 schema
  - Evidence files (photos, PDFs, measurements)
  - Referenced by CID from on-chain record

Verification:
  1. Retrieve CID from on-chain NFT metadata
  2. Fetch content from off-chain storage using CID
  3. Hash the fetched content and compare to on-chain contentHash
  4. Validate fetched content against Layer 3 schema
```

This means Layer 1 includes **Data Reference** operations alongside ledger operations:

| Service | Operations | Purpose |
|---------|-----------|---------|
| Data Reference | pinToIPFS, resolveContent, verifyContentIntegrity | Off-chain content management with on-chain anchoring |

**Implementation Note:** The `pinToIPFS` tool (roadmap) standardizes CID formatting and off-chain storage to prevent developers from accidentally leaking data or formatting CIDs incorrectly. This also surfaces the Dual-Record Pattern vulnerability — that off-chain data pointed to by on-chain hashes can disappear — which LNC (Linear Network Coding) solves at the resilience layer.

#### Design Principles

1. **Stateless**: No internal state beyond connection configuration. Every call is independent.
2. **Evidence-returning**: Every write operation returns transaction IDs, consensus timestamps, and receipt data as proof of ledger inclusion.
3. **SDK-aligned**: Operations map closely to Hiero SDK methods. The layer adds interface standardization, not business logic.
4. **Ledger-anchored**: Content may live off-chain, but integrity is always anchored to on-chain hashes. The ledger is the source of truth for existence and integrity; off-chain storage is the source of truth for content.

#### Configuration

```typescript
interface HederaConfig {
  network: 'testnet' | 'previewnet' | 'mainnet';
  operatorAccountId: string;
  operatorPrivateKey: string;
  supplyKey: string;
  mirrorNodeUrl?: string;
}
```

### 4.2 Layer 2: Governance Primitives

**Package:** `@tressellate/guardian-tools`
**Dependency:** Guardian API + Layer 1
**Responsibility:** Trust, authorization, and policy management

Layer 2 provides governance primitives — operations for creating policies, managing schemas, issuing Verifiable Credentials, executing verification workflows, and maintaining audit trails. It knows HOW to govern but not WHAT is being governed.

#### Capabilities

| Category | Operations | Purpose |
|----------|-----------|---------|
| Policy Management | createPolicy, publishPolicy, listPolicies | Define governance rules |
| Schema Management | createSchema, listSchemas | Define data structures for verification |
| Credential Lifecycle | createVC, verifyVC, createVP, getTrustChain | Issue and verify credentials |
| Workflow | assignRole, submitDocument | Execute policy-driven processes |
| Audit | getAuditTrail | Retrieve governance history |

#### Identity and Persona Resolution

**Architectural Decision:** Both reviewers identified the "Identity blind spot." Gemini proposed a "Persona" pattern in Layer 2; Grok proposed "Identity" as a Layer 3 asset type. We place it in Layer 2 because identity is fundamentally a governance concern (WHO), not an asset registration concern (WHAT). An identity is not something you "register" like a certificate — it is the entity that governs what you CAN register.

A single Ledger Account (Layer 1) can hold multiple Verifiable Credentials (Layer 2) that grant different roles across different Layer 4 domains. This is the **Persona Pattern**:

```
Layer 1: Account 0.0.12345 (single cryptographic identity)
  │
  └→ Layer 2: Persona Credentials
       ├── VC: "Licensed Structural Engineer" (used by Construction domain)
       ├── VC: "Certified Land Verifier" (used by Climate Finance domain)
       └── VC: "Authorized NDA Issuer" (used by Legal domain)
```

Layer 4 domain workflows specify which Persona credentials are required for each operation. Layer 2 resolves the persona at runtime:

```
Layer 4 (Construction): "Authorize Pour requires a Licensed Structural Engineer"
  └→ Layer 2: resolvePersona(accountId, "Licensed Structural Engineer")
       └→ Layer 1: Check account holds the required VC NFT
```

This enables cross-domain identity without creating identity silos per domain.

| Category | Operations | Purpose |
|----------|-----------|---------|
| Persona | resolvePersona, listPersonaCredentials, verifyPersonaForDomain | Cross-domain identity resolution |

#### Cross-Domain Reference Resolution

**Architectural Decision:** Grok identified that real-world use cases require cross-domain asset references (e.g., a Construction inspection referencing a Climate Finance provenance record). We place the Reference Resolver in Layer 2 because cross-domain resolution is a governance concern — it requires policy decisions about which domains trust each other's assets.

```
Layer 2: Reference Resolver
  - resolveReference(sourceAssetId, targetDomain) → resolved asset + trust level
  - registerDomainTrust(domainA, domainB, trustPolicy) → cross-domain trust config
  - verifyChainAcrossDomains(assetId) → full cross-domain trust chain

Resolution Policy:
  1. Source domain registers its asset types with Layer 2
  2. Target domain declares which source domain assets it trusts
  3. Reference Resolver validates that the trust relationship is active
  4. Returns resolved reference with provenance across domain boundary
```

Layer 4 domains register domain-specific resolvers as plugins. This keeps resolution policy-driven without bloating Layer 3.

#### Design Principles

1. **Domain-agnostic**: A carbon credit and a building permit use the same credential issuance tool. Domain semantics are Layer 3/4 concerns.
2. **Policy-driven**: Governance behavior is determined by policy configuration, not hard-coded logic.
3. **Trust chain continuity**: Every governance operation links back to Layer 1 ledger proof.
4. **Identity-aware**: A single ledger account can hold multiple personas across domains, resolved through Verifiable Credentials.

### 4.3 Layer 3: Asset Type Patterns (NEW)

**Package:** `@tressellate/asset-types`
**Dependency:** Layers 1 and 2
**Responsibility:** Reusable, domain-agnostic asset definitions

Layer 3 is the key innovation in the five-layer architecture. It defines **what an asset IS** — its structural properties, lifecycle states, verification rules, and ledger mapping — without any knowledge of which industry or business context will use it.

#### Core Asset Types

Each asset type defines:

1. **Schema shape**: The inherent properties of this asset type
2. **Lifecycle**: The valid state transitions
3. **Verification rules**: How to validate an instance of this asset
4. **Ledger mapping**: How the asset maps to Layer 1 primitives (NFT, token, topic)

##### 4.3.1 Certificate

A verifiable attestation that something meets a defined standard.

```
Schema:
  - contentHash: string        (hash of the certified content)
  - issuerId: string           (who issued the certificate)
  - subjectId: string          (what is being certified)
  - issuedAt: ISO-8601         (when it was issued)
  - expiresAt?: ISO-8601       (optional expiration)
  - standard?: string          (which standard it certifies against)
  - evidence: Reference[]      (supporting evidence references)

Lifecycle:
  DRAFT → ISSUED → ACTIVE → EXPIRED | REVOKED

Ledger Mapping:
  - Asset:     NFT (unique, non-fungible — each certificate is distinct)
  - Metadata:  Base64-encoded JSON in NFT metadata field
  - Audit:     HCS topic message on state transitions
  - Revocation: NFT burn (permanent, irreversible)

Verification:
  1. NFT exists and is not burned (not revoked)
  2. Current date is before expiresAt (not expired)
  3. Content hash matches provided content (integrity)
  4. Issuer is authorized per Layer 2 policy (authority)
```

##### 4.3.2 Provenance Record

An immutable record of origin, chain of custody, or transformation history.

```
Schema:
  - sourceId: string           (origin identifier)
  - sourceType: string         (type of source — mine, farm, lab, etc.)
  - composition: object        (material/data composition details)
  - location?: GeoJSON         (geographic origin)
  - timestamp: ISO-8601        (when provenance was established)
  - parentRecords?: Reference[] (upstream provenance links)
  - transformations?: object[] (processing/transformation steps)

Lifecycle:
  RECORDED → VERIFIED → SUPERSEDED

Ledger Mapping:
  - Asset:     NFT (unique provenance record per source/batch)
  - Metadata:  Base64-encoded JSON with composition data
  - Audit:     HCS topic message with full provenance chain
  - Linking:   NFT metadata references parent NFT serial numbers

Verification:
  1. NFT exists (record was created)
  2. Parent records exist and are verified (chain integrity)
  3. Composition data matches claimed source type (plausibility)
  4. Recorder is authorized per Layer 2 policy (authority)
```

##### 4.3.3 Credit / Currency

A fungible, divisible unit of value representing a measurable quantity.

```
Schema:
  - unit: string               (what one unit represents — tCO2, room-night, etc.)
  - decimals: number           (divisibility — typically 2 for currency, 0 for whole units)
  - backingEvidence: Reference[] (what underlies the value)
  - issuancePolicy: string     (Guardian policy governing issuance)

Lifecycle:
  MINTED → CIRCULATING → REDEEMED | BURNED

Ledger Mapping:
  - Asset:     Fungible Token (HTS — divisible, interchangeable)
  - Supply:    Mint increases supply, burn decreases it
  - Transfer:  HTS transfer between accounts
  - Audit:     HCS topic message on mint, transfer, burn events

Verification:
  1. Token exists with correct configuration (valid asset)
  2. Backing evidence references exist (not unbacked)
  3. Issuance follows authorized policy (authorized creation)
  4. Total supply matches expected based on backing (supply integrity)
```

##### 4.3.4 Agreement

A multi-party commitment with defined terms, parties, and enforcement conditions.

```
Schema:
  - parties: PartyInfo[]       (signers and their roles)
  - termsHash: string          (hash of the agreement text)
  - effectiveDate: ISO-8601    (when the agreement begins)
  - expirationDate?: ISO-8601  (when the agreement ends)
  - conditions?: Condition[]   (conditions for activation/termination)
  - scope: string              (what the agreement covers)

Lifecycle:
  DRAFT → PENDING_SIGNATURES → ACTIVE → EXPIRED | TERMINATED | REVOKED

Ledger Mapping:
  - Asset:     NFT (unique agreement per set of parties)
  - Metadata:  Terms hash + party references (NOT the full text)
  - Transfer:  NFT held by the governed party (proof of participation)
  - Revocation: NFT burn (agreement terminated)
  - Audit:     HCS topic message on signature, activation, termination

Verification:
  1. NFT exists and is held by the party (active participation)
  2. Current date is within effective/expiration range (temporal validity)
  3. All required parties have signed (completeness)
  4. Terms hash matches claimed agreement text (integrity)
```

##### 4.3.5 Inspection Record

A time-stamped observation or assessment by an authorized inspector.

```
Schema:
  - inspectorId: string        (who performed the inspection)
  - subjectId: string          (what was inspected)
  - inspectionType: string     (category of inspection)
  - findings: object           (structured results)
  - result: PASS | FAIL | CONDITIONAL
  - conditions?: string[]      (conditions for CONDITIONAL result)
  - evidence?: Reference[]     (photos, measurements, etc.)
  - timestamp: ISO-8601

Lifecycle:
  SUBMITTED → REVIEWED → ACCEPTED | DISPUTED

Ledger Mapping:
  - Asset:     NFT (unique inspection record)
  - Metadata:  Base64-encoded findings
  - Audit:     HCS topic message with result and reference chain

Verification:
  1. Inspector is authorized for this inspection type (authority)
  2. Findings are structurally complete (completeness)
  3. Timestamp is within valid inspection window (timeliness)
```

##### 4.3.6 Milestone

A verifiable marker of progress within a larger process or project.

```
Schema:
  - projectId: string          (which project/process)
  - milestoneIndex: number     (sequence position)
  - description: string        (what was achieved)
  - evidence: Reference[]      (proof of completion)
  - completedAt: ISO-8601
  - dependencies?: Reference[] (prerequisite milestones)

Lifecycle:
  PENDING → COMPLETED → VERIFIED

Ledger Mapping:
  - Asset:     NFT (unique milestone record)
  - Metadata:  Base64-encoded milestone data with evidence references
  - Audit:     HCS topic message linking to project timeline

Verification:
  1. All dependency milestones are VERIFIED (ordering)
  2. Evidence references are resolvable (completeness)
  3. Reporter is authorized for this project (authority)
```

##### 4.3.7 Claim

A verifiable assertion that triggers a verification workflow. A Claim is the bridge between off-chain reality and on-chain verification — it represents "I assert X happened" and initiates the process of confirming or rejecting that assertion.

**Architectural Decision:** Both Gemini and Grok independently identified the need for this asset type. A Claim is both a lightweight assertion (something happened) and a workflow trigger (now verify it). This dual nature makes it a distinct asset type rather than a transaction pattern, because the claim itself has state (PENDING → VERIFIED vs. REJECTED) and persists as a record regardless of outcome.

```
Schema:
  - claimantId: string         (who is making the assertion)
  - claimType: string          (category of claim — emission, delivery, completion, etc.)
  - assertion: object          (structured description of what is claimed)
  - evidence: Reference[]      (supporting evidence for the claim)
  - submittedAt: ISO-8601      (when the claim was made)
  - verificationPolicy: string (which Layer 2 policy governs verification)
  - resultingAssets?: Reference[] (assets created if claim is verified)

Lifecycle:
  SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED | WITHDRAWN

Ledger Mapping:
  - Asset:     NFT (unique claim record — persists regardless of outcome)
  - Metadata:  Content hash of assertion + evidence references
  - Audit:     HCS topic message on submission, review, and resolution
  - Linking:   If VERIFIED, metadata references resulting asset NFT serials

Verification:
  1. Claimant is authorized to make this type of claim (authority)
  2. Evidence references are resolvable and structurally valid (completeness)
  3. Claim has not been previously submitted for same assertion (uniqueness)
  4. Verification policy exists and is active (governance)
```

**Relationship to other asset types:** A Claim is the input that triggers creation of other assets. For example, a "carbon sequestration claim" (Claim) is verified through dMRV, which then produces a "sequestration certificate" (Certificate) and "carbon credits" (Credit). The Claim persists as an audit record linking the original assertion to the resulting verified assets.

#### Layer 3 Design Principles

1. **Domain-ignorant**: A Certificate does not know whether it certifies soil amendments or medical procedures. Domain semantics are Layer 4 concerns.
2. **Structurally complete**: Each asset type defines all inherent properties. Layer 4 composes asset types and attaches additional fields via domain schemas, but never removes or contradicts Layer 3 structure.
3. **Lifecycle-driven**: Every asset type has explicit state transitions. Invalid transitions are rejected at this layer, not delegated to domain logic.
4. **Verification-first**: Verification rules are built into the asset type, not bolted on by the domain.

#### Lifecycle Enforcement: Formal State Machines with Transition Hooks

**Architectural Decision:** Gemini identified a critical gap: if Layer 3 defines lifecycles but Layer 4 can add states, and agents can call Layer 3 tools directly (bypassing Layer 4), the lifecycle guarantees become hollow. We address this with **Formal State Machines** at Layer 3 and **Transition Hooks** at Layer 4.

Layer 3 implements each lifecycle as a formal state machine that **enforces** valid transitions. Layer 4 does not add new states to the state machine — instead, it registers **transition hooks** that execute domain-specific validation before a transition is allowed to proceed.

```
Layer 3: Certificate State Machine (enforced)
  ┌───────┐     ┌────────┐     ┌────────┐     ┌─────────┐
  │ DRAFT │────→│ ISSUED │────→│ ACTIVE │────→│ EXPIRED │
  └───────┘     └────────┘     └────────┘     └────┬────┘
                                    │               │
                                    └───→ REVOKED ←─┘

Layer 4: Construction Domain Transition Hooks
  before_transition(DRAFT → ISSUED):
    - Validate that all required domain fields are present
    - Verify issuer holds "Licensed Engineer" persona (Layer 2)

  before_transition(ISSUED → ACTIVE):
    - Verify that referenced provenance records are in VERIFIED state
    - Submit domain-specific audit event

  on_transition(any → REVOKED):
    - Require revocation reason (domain policy)
    - Notify dependent assets (domain workflow)
```

This ensures:

1. **Layer 3 controls the "legal" moves** — no agent or domain can create an invalid transition (e.g., DRAFT → ACTIVE skipping ISSUED)
2. **Layer 4 controls the "business" conditions** — domain rules determine WHEN a valid transition is allowed
3. **Direct Layer 3 calls are safe** — the state machine enforces validity even without Layer 4 hooks
4. **Layer 4 hooks are additive** — they add conditions but cannot remove Layer 3 invariants

#### Common Lifecycle Interface

**Architectural Decision:** Grok recommended standardizing lifecycle interfaces across asset types. All asset types implement a common interface:

```typescript
interface AssetLifecycle<TState extends string> {
  readonly currentState: TState;
  readonly validTransitions: Map<TState, TState[]>;

  canTransition(to: TState): boolean;
  transition(to: TState, hooks?: TransitionHook[]): Promise<TransitionResult>;
  getHistory(): StateTransition[];
}

interface TransitionHook {
  phase: 'before' | 'after';
  fromState: string;
  toState: string;
  handler: (context: TransitionContext) => Promise<void>;  // throws to reject
}
```

This standardization enables cross-type workflows (e.g., "a Milestone depends on an Inspection reaching ACCEPTED") to work predictably regardless of the specific asset types involved.

### 4.4 Layer 4: Domain Rules

**Packages:** `@tressellate/domain-agriculture`, `@tressellate/domain-energy`, `@tressellate/domain-healthcare`, `@tressellate/domain-real-estate`, `@tressellate/domain-supply-chain`
**Dependency:** Layers 1 and 3
**Responsibility:** Domain-specific schemas, enums, validation rules, and configuration

Layer 4 defines the shared language for each business domain. Multiple Layer 5 applications can compose the same domain rules — for example, both a crop certification app and a farm management system could share `@tressellate/domain-agriculture`.

#### What Layer 4 Provides

1. **Extended schemas**: Domain-specific fields added to Layer 3 base schemas (e.g., `BiocharProvSchema` extends `ProvenanceSchema`)
2. **Domain enums**: Industry-specific constants (e.g., `BiocharSource`, `AshSource`, `ContractType`)
3. **Validation rules**: Domain-specific constraints (e.g., carbon content thresholds, H/C ratio bounds)
4. **Domain configuration**: Config interfaces extending `HederaConfig` with domain-specific collection/token IDs
5. **Terminology**: Domain-specific names for generic concepts (e.g., "TerraPrimaCert" is a Certificate in the Climate Finance domain)

#### Example: Climate Finance Domain

```
Domain: Climate Finance
Composes: Certificate + Provenance Record + Credit

Workflow: "Issue Soil Carbon Credits"

  Step 1: Record Biochar Provenance (Layer 3: Provenance Record)
    Extended fields: feedstockType, pyrolysisTemp, biocharYield
    Validation: feedstockType must be in approved list

  Step 2: Certify Terra Prima Batch (Layer 3: Certificate)
    Extended fields: formulationId, biocharRatio, microbialProfile
    Validation: must reference a verified Provenance Record

  Step 3: Record Farm Deployment (Layer 3: Milestone)
    Extended fields: farmId, plotCoordinates, applicationRate, soilBaseline
    Validation: must reference a verified Certificate

  Step 4: Mint Soil Carbon Credits (Layer 3: Credit)
    Extended fields: sequestrationTonnes, verificationMethodology, vintage
    Validation: must reference a verified Milestone + MRV data
    Backing evidence: links to Steps 1-3
```

#### Example: Construction Domain

```
Domain: Construction
Composes: Certificate + Provenance Record + Inspection + Milestone + Agreement

Workflow: "Certify Concrete Batch"

  Step 1: Record Material Provenance (Layer 3: Provenance Record)
    Extended fields: xrfComposition, quarryId, supplementaryMaterials
    Validation: volcanic ash content must meet minimum threshold

  Step 2: Certify Mix Design (Layer 3: Certificate)
    Extended fields: mixDesignCode, targetStrength, waterCementRatio, dclOptimization
    Validation: must reference verified material provenance records

  Step 3: Authorize Pour (Layer 3: Certificate)
    Extended fields: pourLocation, structuralElement, volume, weatherConditions
    Validation: requires engineer signature, valid mix certificate

  Step 4: Inspect Placement (Layer 3: Inspection Record)
    Extended fields: slumpTest, airContent, cylinderSamples
    Validation: inspector must hold jurisdiction-specific license
```

#### Example: Document Registry (Hypothetical)

To illustrate extensibility, here is how a generic document registry would work:

```
Domain: Legal Document Management
Composes: Certificate + Agreement

Asset: "Notarized Document" (composes Certificate)
  Additional fields: documentType, jurisdiction, notaryId, notaryCommission
  Validation: notaryId must be active in specified jurisdiction
  Transition hook: before_transition(ISSUED → ACTIVE) requires notarization step

Asset: "Multi-Party Contract" (composes Agreement)
  Additional fields: governingLaw, disputeResolution, amendmentHistory[]
  Validation: all parties must have verified identity credentials (Layer 2)
  Workflow: draft → legal review → signature collection → notarization → active
```

The key insight: **this new domain required zero changes to Layers 1, 2, or 3.** It only needed new Layer 4 and Layer 5 configuration.

### 4.5 Layer 5: Application Workflows

**Packages:** `@tressellate/crop-cert`, `@tressellate/lease`, `@tressellate/parts-prov`, `@tressellate/rec`, `@tressellate/drug-cert`
**Dependency:** Layers 1, 3, and 4
**Responsibility:** Concrete MCP tool definitions, multi-step workflows, server composition, and deployment

Layer 5 is where tools are defined and workflows are wired. Each application package composes Layer 3 operation factories with Layer 4 domain schemas to produce named MCP tools.

#### What Layer 5 Provides

1. **MCP tool definitions**: Named tools with `inputSchema`, `description`, and `implementation` (e.g., `bcb_certify_terra_prima`, `ics_certify_mix`)
2. **Workflow orchestration**: Multi-step business processes that compose multiple Layer 3 operations
3. **Application-specific configuration**: Server-level config, environment variable mapping
4. **Tool registration**: Barrel exports of tool arrays for server composition

#### Composition Pattern

```typescript
// Layer 5 tool composes Layer 3 factory + Layer 4 schema:
const certifyTerraPrima = createMintNFTAsset<ClimateFinanceConfig, CertifyArgs>({
    schemaType: 'TERRA_PRIMA_CERT',
    assetType: 'Certificate',
    getCollectionId: (config) => config.bcbTerraPrimaCollectionId,
    getAuditTopicId: (config) => config.bcbAuditTopicId,
    domainTag: 'BCB',
    buildMetadata: (args) => ({ /* TerraPrimaCertSchema fields */ }),
    buildAuditMessage: (args, result) => `Certified batch ${args.batchId}`,
});
```

#### Application Packages

| Package | Domain | Tools |
|---------|--------|-------|
| `@tressellate/crop-cert` | Agriculture | 5 tools: crop yield certificate collection, issuance, verification, audit trail, record query |
| `@tressellate/lease` | Real Estate | 5 tools: lease collection, grant, payment milestone, verification, audit trail |
| `@tressellate/parts-prov` | Supply Chain | 5 tools: parts collection, provenance recording, quality certification, verification, audit trail |
| `@tressellate/rec` | Energy | 6 tools: REC token creation, generation certificate, minting, retirement, verification, audit trail |
| `@tressellate/drug-cert` | Healthcare | 5 tools: drug lot collection, certification, custody transfer, verification, audit trail |

---

## 5. The MCP Interface: Agentic Orchestration

### 5.1 Why MCP Matters

The Model Context Protocol provides a standardized interface between AI agents and tools. By exposing each layer as MCP tools, Tressellate enables AI agents to:

1. **Discover available operations** through tool listing
2. **Understand parameters** through structured input schemas with descriptions
3. **Reason about multi-step workflows** by composing tool calls
4. **Verify outcomes** through structured output with evidence
5. **Self-correct** through actionable error messages

### 5.2 Tool Naming Convention

```
Layer 1: hedera_{operation}          (e.g., hedera_create_token)
Layer 2: guardian_{operation}        (e.g., guardian_create_vc)
Layer 3: {assettype}_{operation}     (e.g., certificate_issue, provenance_record)
Layer 4: (no direct tools — provides schemas and validation to Layer 5)
Layer 5: {app}_{operation}           (e.g., bcb_certify_terra_prima, ics_certify_mix)
```

### 5.3 Server Composition

MCP servers are thin composition points that combine tools from relevant layers:

```typescript
// A Climate Finance MCP server composes all five layers:
const ALL_TOOLS = [
  ...HEDERA_TOOLS,        // Layer 1: ledger operations
  ...GUARDIAN_TOOLS,       // Layer 2: governance operations
  // Layer 3: operation factories (used internally by Layer 5, not directly exposed)
  // Layer 4: domain schemas/enums (used internally by Layer 5, not directly exposed)
  ...BCB_TOOLS            // Layer 5: BCB application tools (bcb_certify_*, bcb_query_*, etc.)
];
```

An AI agent connected to this server can operate at any level of abstraction:

- **Low-level**: "Mint 100 tokens to account 0.0.12345" (Layer 1)
- **Governance**: "Create a verification policy for carbon sequestration" (Layer 2)
- **Business**: "Certify this Terra Prima batch and issue soil carbon credits" (Layer 5)

### 5.4 Dynamic Tool Discovery

**Architectural Decision:** Gemini identified that as domains grow, a universal Tressellate server could expose 200+ tools, causing "tool confusion" and consuming the agent's context window. We adopt **Dynamic Tool Discovery** — instead of loading all tools upfront, agents discover and load domain-specific tool sets on demand.

```
Always-available meta-tools:
  tressellate_list_domains()          → ["climate-finance", "construction", "hospitality", "legal"]
  tressellate_load_domain(domain)     → Loads Layer 5 tools for that domain's applications
  tressellate_describe_domain(domain) → Returns available workflows, asset types, and tool summaries

Layered loading:
  Layer 1 tools (hedera_*):        Always loaded (infrastructure primitives)
  Layer 2 tools (guardian_*):       Always loaded (governance primitives)
  Layer 3+4 (internal):            Used internally by Layer 5, not directly exposed as tools
  Layer 5 tools (bcb_*, ics_*):    Loaded only when that specific application is activated
```

This means an agent processing a carbon credit request calls `tressellate_load_domain("climate-finance")` and only sees the relevant ~20 tools, not all 200+ across every domain.

### 5.5 Agentic Guardrails: The Intent Pattern

**Architectural Decision:** Gemini identified that giving AI agents unrestricted access to destructive operations (NFT burn = revocation, token burn = supply reduction) is a safety gap. We adopt the **Intent Pattern** — destructive operations require a two-phase commit with human approval.

```
Phase 1: Agent creates an Intent (non-destructive)
  → tressellate_request_revocation(certificateId, reason)
  → Creates a "RevocationIntent" record (Layer 3: Claim asset type)
  → Returns: intentId, summary for human review

Phase 2: Human approves via Layer 1 multi-signature
  → tressellate_approve_intent(intentId, approverSignature)
  → Layer 2 validates approver holds required persona
  → Layer 1 executes the actual burn operation
  → Audit trail records both the intent and the approval
```

Operations requiring the Intent Pattern:

| Operation | Risk Level | Approval Required |
|-----------|-----------|-------------------|
| NFT burn (revocation) | **Destructive** — permanent, irreversible | Human signature via Layer 1 |
| Token burn (supply reduction) | **Destructive** — reduces circulating value | Human signature via Layer 1 |
| Policy modification | **High impact** — changes governance rules | Policy admin approval |
| Cross-domain reference creation | **Medium impact** — creates trust dependency | Domain admin approval |
| Token mint / NFT mint | **Additive** — creates new assets | Agent-authorized (non-destructive) |
| Audit trail submission | **Additive** — records events | Agent-authorized (non-destructive) |
| Read / query operations | **None** — read-only | No approval needed |

This ensures AI agents can orchestrate complex workflows autonomously for additive operations while requiring human oversight for destructive or high-impact actions.

### 5.6 Agentic Workflow Example

An AI agent handling a complete carbon credit issuance:

```
User: "We have a new biochar batch from the Mindanao facility.
       Process it through to carbon credit issuance."

Agent reasoning:
  1. I need to record provenance first (Layer 4 workflow tells me this)
  2. Then certify the batch (Layer 4 workflow, next step)
  3. Then record deployment (Layer 4 workflow, next step)
  4. Then mint credits (Layer 4 workflow, final step)

Agent actions:
  → Calls bcb_record_biochar (Layer 4)
    → Which calls provenance_record (Layer 3)
      → Which calls guardian_create_vc + hedera_mint_nft (Layers 2+1)
        → Returns: NFT serial #47, consensus timestamp, tx ID

  → Calls bcb_certify_batch (Layer 4)
    → Which calls certificate_issue (Layer 3, references provenance #47)
      → Which calls guardian_create_vc + hedera_mint_nft (Layers 2+1)
        → Returns: NFT serial #48, consensus timestamp, tx ID

  → Calls bcb_record_deployment (Layer 4)
    → Which calls milestone_complete (Layer 3, references certificate #48)
      → Which calls hedera_mint_nft + hedera_submit_message (Layer 1)
        → Returns: NFT serial #49, consensus timestamp, tx ID

  → Calls bcb_mint_soil_credit (Layer 4)
    → Which calls credit_mint (Layer 3, references milestone #49)
      → Which calls hedera_mint_token + hedera_submit_message (Layer 1)
        → Returns: 150 SOILCARBON tokens minted, tx ID, audit timestamp

Agent response:
  "Processed biochar batch from Mindanao. Created provenance record (#47),
   batch certificate (#48), deployment record (#49), and minted 150 soil
   carbon credits. All transactions verified on Hedera testnet. Full
   audit trail available on topic 0.0.XXXXX."
```

### 5.7 Countering the AI Black Box

As AI agents orchestrate production systems, the gap between intent and execution becomes opaque. An agent reasons internally, proposes an action, and executes it on external infrastructure — but without a structured protocol at the execution boundary, there is no inspectable record of what was requested, why, or whether the outcome matched the intent.

This is the **agentic black box** problem. Tressellate's architecture directly counters it at the execution boundary — exactly where opaque reasoning meets real-world action — through four structural properties:

#### 5.7.1 Auditable Execution Boundary

The real danger of AI opacity isn't the LLM's internal reasoning — regulators increasingly accept that neural networks are not fully interpretable. The danger is when **opaque reasoning leads to opaque actions**. EU AI Act Article 14 (human oversight) and Article 13 (transparency) regulate the *decision-to-action boundary*, not the weights.

MCP draws a hard, inspectable line at exactly this point. Every tool call is a structured JSON-RPC request with explicit parameters, and every response is a structured result. This creates a complete, machine-readable audit trail at the execution layer — exactly where black-box risk becomes most dangerous.

#### 5.7.2 Composable Trust Through Layer Independence

A monolithic AI system is a single black box. Tressellate's five independent layers are five independently attestable components:

- **Layer 1** can be verified against Hiero SDK behavior (deterministic)
- **Layer 2** can be verified against Guardian policy rules (deterministic)  
- **Layer 3** can be verified against asset type state machines (deterministic)
- **Layer 4** can be verified against domain validation rules (deterministic)
- **Layer 5** can be verified against tool call logs and ledger receipts (auditable)

This composability means transparency compounds: you don't need to understand the AI agent's internal reasoning to verify that a specific action was authorized, valid, and correctly executed. PwC can audit Layer 1 hashgraph operations separately from Layer 5 agent tool behavior — the same methodology that applies to traditional financial audits.

#### 5.7.3 Detecting Agentic Drift

Over successive autonomous iterations, AI agents can gradually move system behavior away from intended parameters. Each individual deviation may be small and individually rational, but collectively they can produce significant, untraceable divergence from design intent — a phenomenon we call **agentic drift**.

Tressellate makes drift detectable by design through two mechanisms:

1. **Fixed-contract tool interfaces**: Tool schemas are defined at deployment, not generated at runtime. An agent cannot create new tool behavior — it can only call tools with defined parameters. This bounds the space of possible actions.

2. **Per-action ledger attestation**: Every meaningful action produces a ledger receipt with consensus timestamp. Drift analysis becomes a query over timestamped, structured records rather than an archaeological excavation of opaque logs.

#### 5.7.4 LLM Opacity Is Irrelevant

The LLM's internal reasoning will always contain some opacity — neural networks are not fully interpretable. But in Tressellate's architecture, this opacity is **irrelevant** because the model has no unmediated authority. It can only call tools with defined parameters through the MCP protocol, and every resulting action is validated by the deterministic layers below.

The LLM proposes; the ledger disposes.

You don't need to audit the AI's reasoning when you can audit every action it takes. The execution boundary is the accountability boundary, and it is fully inspectable.

#### 5.7.5 Compounding Attestation Value

Regulatory frameworks like the EU AI Act (2024) set a compliance floor — transparency, traceability, and contestability for high-risk AI systems. Tressellate meets these requirements structurally:

| Regulatory Requirement | Tressellate Mechanism |
|----------------------|---------------------|
| **Transparency** (Art. 13) | Structured tool schemas with explicit descriptions, discoverable by inspection |
| **Human oversight** (Art. 14) | Intent Pattern for destructive operations, two-phase commit with human approval |
| **Traceability** (Art. 12) | Per-action ledger receipts with consensus timestamps, immutable audit trails |
| **Contestability** | On-chain evidence enables independent verification of any agent action |
| **Risk management** (Art. 9) | Layer-by-layer bounded scope prevents monolithic risk accumulation |

But compliance is the floor. The ceiling is that each domain attested on Tressellate creates a reusable attestation methodology that transfers to the next domain at reduced cost. PwC attests procurement governance across Layers 1–5. The same methodology applies to carbon verification, supply chain, healthcare — at decreasing cost and increasing confidence. This creates a **compounding trust network** that no single-domain solution can replicate.

---

## 6. Verification Model

### 6.1 Evidence at Every Layer

Every write operation across all layers returns verification evidence:

| Layer | Evidence Type | Example |
|-------|--------------|---------|
| Layer 1 | Transaction receipt | `{ transactionId: "0.0.123@1709...456", consensusTimestamp: "..." }` |
| Layer 2 | Trust chain | `{ vcId: "did:hedera:...", policyId: "...", trustChainId: "..." }` |
| Layer 3 | Asset reference | `{ assetType: "certificate", nftSerial: 48, status: "ACTIVE" }` |
| Layer 4 | Domain result | `{ workflow: "batch_certification", batchId: "BCB-2026-047", credits: 150 }` |

### 6.2 Trust Chain Continuity

The verification chain is continuous from Layer 4's domain result through Layer 1's ledger proof:

```
Layer 4 result: "150 soil carbon credits issued for batch BCB-2026-047"
  └→ Layer 3 reference: Credit mint backed by Milestone #49, Certificate #48, Provenance #47
       └→ Layer 2 credential: Verifiable Credential vc:hedera:... signed by authorized verifier
            └→ Layer 1 proof: HTS transaction 0.0.123@170... with consensus timestamp
                 └→ Hiero network: aBFT consensus across network nodes
```

Any claim can be independently verified by walking this chain.

### 6.3 Immutability Guarantees

- **NFTs** (Certificates, Provenance Records, Agreements, Inspections, Milestones): Metadata is immutable once minted. Revocation = burn (permanent, visible).
- **Fungible Tokens** (Credits, Currencies): Supply changes are recorded as mint/burn transactions. Transfer history is preserved on-chain.
- **Audit Trail** (HCS Topics): Messages are immutable, fair-ordered, and timestamped by consensus. Cannot be altered or deleted.

---

## 7. Extensibility

### 7.1 Adding a New Asset Type (Layer 3)

To add a new asset type (e.g., "License"):

1. Define the schema (inherent properties)
2. Define the lifecycle states and transitions
3. Define verification rules
4. Map to Layer 1 primitives (NFT, token, or topic)
5. Implement as a reusable tool set

No changes to Layers 1, 2, or 4 are required.

### 7.2 Adding a New Domain (Layer 4)

To add a new domain (e.g., "Healthcare"):

1. Identify which Layer 3 asset types the domain needs
2. Define extended schemas (domain-specific fields)
3. Define validation rules (domain-specific constraints)
4. Define workflows (multi-step business processes)
5. Map domain terminology to asset type operations

No changes to Layers 1, 2, or 3 are required.

### 7.3 Extensibility Matrix

| I want to... | Which layer changes? | Other layers affected? |
|--------------|---------------------|----------------------|
| Support a new Hiero service | Layer 1 | None |
| Add a governance capability | Layer 2 | None |
| Define a new asset type | Layer 3 | None |
| Build for a new industry | Layer 4 | None |
| Upgrade the Hiero SDK | Layer 1 | None (interfaces stable) |
| Change Guardian API version | Layer 2 | None (interfaces stable) |
| Add fields to an asset type | Layer 3 | Layer 4 may use new fields |
| Change domain validation rules | Layer 4 | None |

The key claim: **each layer can evolve independently.**

---

## 8. Package Structure

```
tressellate/
├── core/                                # Layers 1-3 (shared infrastructure)
│   ├── hashgraph-tools/                 # Layer 1: Ledger Infrastructure
│   │   └── src/tools/
│   │       ├── token.ts                 # Fungible token operations
│   │       ├── nft.ts                   # NFT operations
│   │       ├── consensus.ts             # HCS audit trail operations
│   │       ├── account.ts               # Account management
│   │       └── query.ts                # Mirror node queries
│   │
│   ├── guardian-tools/                  # Layer 2: Governance Primitives
│   │   └── src/
│   │       ├── config.ts                # GuardianConfig + GovernanceProvider interface
│   │       ├── types.ts                 # VerifiableCredential, PersonaCredential, Policy
│   │       └── index.ts                # GUARDIAN_TOOLS barrel export
│   │
│   └── asset-types/                     # Layer 3: Asset Type Patterns
│       └── src/
│           ├── schemas/                 # 7 universal schema types
│           │   ├── certificate.ts       # CertificateSchema
│           │   ├── provenance.ts        # ProvenanceSchema
│           │   ├── credit.ts            # CreditSchema
│           │   ├── agreement.ts         # AgreementSchema
│           │   ├── inspection.ts        # InspectionSchema
│           │   ├── milestone.ts         # MilestoneSchema
│           │   └── claim.ts             # ClaimSchema
│           └── factories/               # 5 operation factories
│               ├── mint-nft-asset.ts    # createMintNFTAsset
│               ├── mint-token-asset.ts  # createMintTokenAsset
│               ├── query-audit-trail.ts # createQueryAuditTrail
│               ├── query-record.ts      # createQueryRecord
│               └── agreement-lifecycle.ts # createAgreementLifecycle
│
├── examples/                            # Layers 4-5 (domain demonstrations)
│   ├── domains/                         # Layer 4: Domain Rules
│   │   ├── agriculture/                 # Composes: Certificate + Inspection
│   │   ├── energy/                      # Composes: Credit + Certificate
│   │   ├── healthcare/                  # Composes: Certificate + Provenance
│   │   ├── real-estate/                 # Composes: Agreement + Milestone
│   │   └── supply-chain/               # Composes: Provenance + Certificate
│   │
│   ├── apps/                            # Layer 5: Domain tool packages (26 tools)
│   │   ├── crop-cert/                   # Agriculture: crop yield certification
│   │   ├── lease/                       # Real estate: lease agreement management
│   │   ├── parts-prov/                  # Supply chain: parts provenance tracking
│   │   ├── rec/                         # Energy: renewable energy credits
│   │   └── drug-cert/                   # Healthcare: drug lot certification
│   │
│   └── servers/                         # Layer 5: MCP stdio servers
│       ├── crop-cert/                   # Agriculture MCP server
│       ├── lease/                       # Real estate MCP server
│       ├── parts-prov/                  # Supply chain MCP server
│       ├── rec/                         # Energy MCP server
│       └── drug-cert/                   # Healthcare MCP server
```

---

## 9. Design Decisions and Trade-offs

### 9.1 Why Five Layers Instead of Three?

**Trade-off:** Additional complexity vs. reusability and separation of concerns.

The original three-layer architecture (Infrastructure → Governance → Domain) worked well for initial development. However, as we built four domain implementations, we observed that asset type patterns were being independently re-implemented in each domain. The four-layer architecture extracted these patterns into a shared layer (Layer 3: Asset Types). The five-layer architecture further separates the original "Domain Workflows" layer into **Domain Rules** (Layer 4: shared schemas, enums, validation) and **Application Workflows** (Layer 5: concrete MCP tools and deployments). This enables multiple applications to share the same domain language — for example, BCB and a future REDD+ application both compose `@tressellate/domain-climate-finance`.

**Risk:** Layer 3 could become a "god layer" if asset types are too broadly defined. We mitigate this by keeping asset types structurally minimal — they define shape and lifecycle, not business logic.

### 9.2 Why Asset Types Are Not Domain-Specific

**Trade-off:** Generality vs. precision.

A domain-specific "CarbonCertificate" type would be more precise than a generic "Certificate" extended with domain fields. However, precision at Layer 3 would prevent reuse across domains and create a combinatorial explosion of types (N asset types × M domains = N×M implementations instead of N+M).

**Risk:** The generic asset type may not capture domain-specific lifecycle nuances. We mitigate this by allowing Layer 4/5 to extend the lifecycle with additional states (e.g., a Notarized Document adds a NOTARIZED state to the Certificate lifecycle).

### 9.3 Why NFTs for Unique Assets and Fungible Tokens for Credits

**Trade-off:** On-chain storage cost vs. verification independence.

Storing metadata in NFTs increases on-chain storage costs compared to off-chain storage with on-chain hashes. However, it enables fully independent verification — any party can verify an asset by querying the ledger without access to an off-chain database.

**Risk:** Metadata size limits on Hiero (100 bytes per NFT metadata field as of current SDK). We mitigate this by storing only content hashes and essential references on-chain, with full content available through off-chain storage referenced by the hash.

### 9.4 Why MCP Over Direct API

**Trade-off:** Protocol overhead vs. agent compatibility.

MCP adds a protocol layer between the AI agent and the tools. A direct API would be more efficient for programmatic access. However, MCP provides standardized tool discovery, structured error handling, and compatibility with any MCP-enabled AI agent — making the framework immediately accessible to Claude, GPT, and any future agent system.

**Risk:** MCP is a relatively new protocol and may evolve in breaking ways. We mitigate this by keeping MCP integration at the server level (thin composition points), not in the core library logic.

### 9.5 Security Considerations

**Architectural Decision:** Grok uniquely identified the absence of a security section as a gap. For a framework handling financial instruments (carbon credits, bonds), access control (NDAs), and compliance records, explicit threat modeling is critical.

#### 9.5.1 Layer 1: Key Management and Transaction Security

**Threat:** Compromised private keys allow unauthorized minting, burning, or transfers of tokens and NFTs.

**Mitigations:**
- **Key rotation**: Hiero supports key structures with threshold signatures. Admin keys should use multi-sig (e.g., 2-of-3) for treasury operations.
- **Key separation**: Distinct keys for supply operations (mint/burn) vs. transfer operations vs. admin operations. A compromised transfer key cannot mint new tokens.
- **Hardware security modules**: Production deployments should use HSMs or institutional custody solutions for keys controlling high-value treasuries.
- **Rate limiting**: Layer 1 tools should enforce configurable rate limits on write operations to detect and slow automated abuse.

#### 9.5.2 Layer 2: Governance Exploits

**Threat:** Policy manipulation — an attacker who gains Guardian admin access can modify verification policies to approve fraudulent credentials.

**Mitigations:**
- **Policy immutability**: Published policies should be versioned and immutable. Modifications create new policy versions, with the previous version's credentials remaining valid under their original terms.
- **Persona separation**: The Persona pattern (Section 4.2.5) ensures that Guardian admin credentials are distinct from domain operator credentials. Compromising a domain operator does not grant governance-level access.
- **Audit trail integrity**: All policy changes are recorded to HCS topics. Since HCS messages are immutable and fair-ordered, a policy modification cannot be backdated or hidden.

#### 9.5.3 Layer 3: Sybil Attacks on Asset Registration

**Threat:** An attacker creates many accounts and floods the system with fraudulent asset registrations (fake certificates, fake provenance records) to overwhelm verification or pollute the registry.

**Mitigations:**
- **Token association requirement**: Hiero's token association model requires explicit opt-in before an account can receive tokens. This prevents drive-by registration spam.
- **Verification gates**: Layer 2 policies can require that asset creators hold specific Verifiable Credentials (e.g., an authorized verifier credential) before Layer 3 tools will accept registration requests.
- **Economic cost**: Every Hiero transaction has a deterministic USD-denominated cost. Mass registration is economically expensive, creating a natural sybil resistance mechanism.

#### 9.5.4 Layer 4/5: Oracle and Data Integrity Failures

**Threat:** Application workflows depend on external data (MRV sensor readings, lab test results, third-party inspections). If the oracle providing this data is compromised or faulty, the on-chain records become meaningless — "garbage in, garbage out."

**Mitigations:**
- **Multi-source verification**: High-value workflows (carbon credit issuance, batch certification) should require data from multiple independent sources before Layer 5 triggers Layer 3 asset creation.
- **Anomaly detection**: Layer 4 validation rules should include statistical bounds checking. A sensor reporting 10x the expected sequestration rate triggers a review flag rather than automatic credit issuance.
- **Revocation capability**: The Intent Pattern (Section 5.5) combined with the Claim asset type (Section 4.3.7) allows disputed assets to be challenged and, if warranted, revoked through proper governance channels.
- **Provenance chain**: Every data input should itself be recorded as a Provenance Record (Layer 3), creating a traceable chain from raw data to issued asset.

#### 9.5.5 Cross-Cutting: Agent Authorization

**Threat:** An AI agent with broad MCP tool access could be prompt-injected or hallucinate destructive actions.

**Mitigations:**
- **Intent Pattern**: Destructive operations require human approval (Section 5.5).
- **Scoped tool loading**: Dynamic Tool Discovery (Section 5.4) limits the tools available to an agent to only those relevant to the current domain.
- **Audit everything**: Every agent action passes through Layer 1 (HCS audit trail), creating a complete, tamper-proof record of what was done, when, and by whom.
- **Persona-bound agents**: An AI agent operates under a specific Persona (Layer 2), meaning its authorization is limited to the roles granted by its Verifiable Credentials — not by its tool access.

### 9.6 Schema Versioning Strategy

**Architectural Decision:** Both reviewers flagged schema evolution as a critical gap. On-chain assets are immutable — once an NFT is minted with schema v1, its metadata cannot be updated to v2. The framework needs a strategy for evolving schemas without breaking existing assets.

#### Approach: "Superseded By" Reference Chain

```
Schema v1 (original):
  { version: "1.0", fields: { material: string, source: string } }

Schema v2 (adds XRF data):
  { version: "2.0", supersedes: "1.0", fields: { material: string, source: string, xrfData: object } }

On-chain behavior:
  - Existing v1 assets remain valid and queryable under v1 rules
  - New assets are created using v2 schema
  - v2 tools can read v1 assets by applying default values for new fields
  - v1 tools reject v2 assets (forward-incompatible by default)
```

#### Version Metadata in Every Asset

Every Layer 3 asset includes version metadata in its on-chain representation:

```
NFT metadata (on-chain, ≤100 bytes):
  { cid: "bafybeig...", schemaVersion: "2.0", assetType: "certificate" }

Off-chain content (IPFS/Arweave):
  {
    schemaVersion: "2.0",
    schemaId: "certificate-v2",
    supersedes: "certificate-v1",
    ...domainFields
  }
```

#### Versioning Rules

1. **Additive changes** (new optional fields): Minor version bump (1.0 → 1.1). Backward-compatible — v1.0 tools can read v1.1 assets.
2. **Breaking changes** (new required fields, field type changes): Major version bump (1.0 → 2.0). Forward-incompatible — v1.0 tools cannot process v2.0 assets.
3. **Deprecation**: Old schema versions are marked deprecated but never removed. Existing on-chain assets under old versions remain valid indefinitely.
4. **Migration**: Layer 4 domains may implement migration workflows that create new v2 assets referencing the original v1 asset, rather than modifying the original.

---

## 10. Open Questions for Review

This section reflects the current state after incorporating feedback from two independent AI architecture reviews (Gemini, Grok). Questions that have been resolved are marked as such with references to the relevant sections. Remaining open questions are areas where further critique is most valuable.

### 10.1 Resolved Questions

These questions from the initial draft have been addressed in this version:

1. **~~Is the asset type list complete?~~** → **Resolved.** Both reviewers independently identified "Claim" as a missing asset type. Added as Section 4.3.7. Identity is handled as a Layer 2 concern (Persona pattern, Section 4.2.5) rather than a Layer 3 asset type. "Delegation" can be modeled as a composition of Agreement + Persona credentials at Layer 4.

2. **~~Are the lifecycle definitions correct?~~** → **Resolved.** Both reviewers converged on the need for a common lifecycle interface with formal state machines. Added as Section 4.4 (Common Lifecycle Interface) with `AssetLifecycle<TState>` interface and transition hooks enabling Layer 4 domain customization.

3. **~~How should cross-domain references work?~~** → **Resolved.** Both reviewers identified the need for a Layer 2 Cross-Domain Reference Resolver. Added as Section 4.2.6 with policy-driven resolution and trust boundary enforcement.

4. **~~Schema evolution strategy~~** → **Resolved.** Added "Superseded By" reference chain strategy as Section 9.6. Additive changes are backward-compatible; breaking changes create new major versions; on-chain assets under old versions remain valid.

5. **~~Where does off-chain data live?~~** → **Resolved.** Dual-Record Pattern formalized in Section 4.1 (Layer 1 specification). On-chain stores CID/hash pointers (≤100 bytes); off-chain stores full structured content via IPFS/Arweave.

### 10.2 Resolved Architecture Questions

6. **~~Layer 3 as library vs. service~~** → **Resolved.** Keep as a library. An independent third-party review (Gemini) confirmed: transitioning Layer 3 to a centralized service orchestrator introduces a single point of failure and network latency. The trigger for service extraction would be multiple discrete Layer 5 MCP servers (on different infrastructure) needing to mutually enforce cross-application state transitions synchronously. Until that need arises, library deployment is correct.

7. **~~Guardian as pluggable interface~~** → **Resolved.** Implement now. Layer 2 defines a `GovernanceProvider` interface that Guardian implements. This allows lightweight alternatives (e.g., a Hedera Smart Contract RBAC plugin) for teams that need Tressellate capabilities (L1, L3, L4, L5) but only require simple Role-Based Access Control. This significantly lowers the barrier to entry for smaller projects. See `core/guardian-tools/src/governance-provider.ts`.

8. **Multi-chain future**: Both reviewers raised ledger-agnosticism. The current architecture is Hiero-specific. Making Layer 1 a pluggable adapter is feasible (Layer 3 already references abstract operations like "mint NFT" rather than Hiero-specific calls). Deferred until ecosystem demand justifies the abstraction cost.

### 10.3 Resolved Implementation Questions

9. **~~Verification performance~~** → **Resolved.** For recursive trust chains (Credit → Certificate → Inspection → Claim), implement a localized verification caching layer within the Layer 5 server, keyed by the on-chain hash and verified timestamp. Alternatively, Guardian Verifiable Presentations (VPs) can package the entire recursive proof into a single cryptographically verifiable payload that only needs to be validated once. Both approaches are valid; the choice depends on deployment topology.

10. **Guardian integration depth**: Layer 2 is currently the least implemented. The `GovernanceProvider` interface (question 7) establishes the minimum viable contract. Guardian implements the full interface; lightweight providers implement the subset they support. The Persona pattern and Reference Resolver depend on the full Guardian implementation but degrade gracefully when a simpler provider is used.

11. **Intent Pattern granularity**: The current Intent Pattern (Section 5.5) defines broad risk categories. Layer 4 domains should be able to customize which operations require human approval via transition hooks (Section 4.4), while the framework-level risk classification provides defaults. This is consistent with the "Layer 3 controls legal moves, Layer 4 controls business conditions" principle.

### 10.4 Resolved Philosophical Questions

12. **Is "asset type" the right abstraction?** Retained as "asset type." The lifecycle semantics (state machines, transition hooks, verification rules) are the core value of Layer 3. "Registry pattern" loses these semantics. The fact that some instances (Inspection records) don't carry financial value is acceptable — "asset" in this context means "a thing with state, ownership, and a lifecycle," not necessarily "a thing with monetary value."

13. **~~Claim as assertion vs. workflow trigger~~** → **Resolved.** Keep unified. A Claim acting as both an immutable on-chain record of an assertion ("I planted 100 trees") and the stateful trigger for a verification workflow perfectly mirrors real-world bureaucratic processes. When a claim is rejected, you still want the immutable record that it was attempted. Separating them would create unnecessary complexity.

14. **Composition depth limits**: Layer 4 domains compose Layer 3 asset types, and assets can reference other assets. The framework should enforce a configurable maximum reference depth (default: 5) at the Layer 5 server level, with verification tools returning a "depth exceeded" flag rather than silently truncating. This prevents circular dependencies while allowing legitimate deep chains.

### 10.5 Schema Evolution: Agent Traversal

**Architectural Decision:** When an AI agent queries an asset and receives a v1.0 schema, should the MCP tool automatically traverse the "Superseded By" graph to find a v2.0 replacement, or return the v1.0 with a flag?

**Resolution:** Return the v1.0 asset with a `superseded: true` flag and a `supersededBy: Reference` pointer. The agent decides whether to follow the chain. This is more composable (consistent with design principles) — auto-traversal hides state from the agent and prevents it from reasoning about schema evolution. The Layer 5 tool may provide a convenience method `resolveLatestVersion(assetId)` for agents that want automatic traversal.

---

## 11. Comparison with Existing Approaches

### 11.1 vs. Traditional DApp Architecture

Traditional DApps embed business logic in smart contracts, creating tight coupling between domain rules and ledger operations. Tressellate separates these concerns across four layers, enabling domain logic changes without contract redeployment.

### 11.2 vs. Token Standards (ERC-721, ERC-1155)

Token standards define the interface for asset operations but not the semantics of what those assets represent. Tressellate Layer 3 provides the semantic layer — a Certificate has a lifecycle, verification rules, and structural properties that an ERC-721 does not define.

### 11.3 vs. Verifiable Credential Ecosystems (W3C VC)

W3C Verifiable Credentials provide a standard for credential issuance and verification. Tressellate integrates with this standard through Layer 2 (Guardian) but extends it with asset lifecycle management, multi-step workflows, and ledger-backed immutability that the VC specification does not cover.

### 11.4 vs. Enterprise Blockchain Platforms (Hyperledger Fabric, R3 Corda)

Enterprise blockchain platforms provide permissioned ledger infrastructure but require significant custom development for each use case. Tressellate provides the same separation of concerns with pre-built asset type patterns and domain composition, reducing the development cost of new use cases from months to days.

---

## 12. Summary

Tressellate is a five-layer framework for universal asset registration and verification:

1. **Layer 1 (Ledger)**: HOW things are recorded — Hiero infrastructure primitives
2. **Layer 2 (Governance)**: WHO can do what — Guardian trust and policy primitives
3. **Layer 3 (Asset Types)**: WHAT is being registered — reusable structural patterns
4. **Layer 4 (Domain Rules)**: WHY — domain-specific schemas, enums, and validation
5. **Layer 5 (Applications)**: WHERE — concrete MCP tools, workflows, and deployments

The framework enables AI agents to orchestrate complex, multi-step verification workflows through the Model Context Protocol, with every operation producing verifiable evidence on a distributed ledger.

The core innovation is the separation of asset type patterns (Layer 3) from domain rules (Layer 4) from application workflows (Layer 5), creating a composable system where new industries can be onboarded by composing existing asset types with domain-specific rules, and multiple applications can share the same domain language — without modifying any infrastructure, governance, or asset type code.

---

*Tressellate: the lattice that gives structure to organic growth.*

*Version 3.0 — Five-Layer Architecture*
*March 2026 — Arnold Alagar*
