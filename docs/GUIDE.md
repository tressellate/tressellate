# Building on Tressellate

A step-by-step guide to implementing domain-specific tokenized assets using the 5-layer architecture.

This guide walks through the included examples and shows you how to build your own domain from scratch. By the end, you'll have an MCP server that lets any AI agent create, verify, and audit tokenized assets on the Hiero (Hedera Hashgraph) network.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Understanding the Layers](#understanding-the-layers)
3. [The 5 Included Examples](#the-5-included-examples)
4. [Step-by-Step: Build Your Own Domain](#step-by-step-build-your-own-domain)
5. [Connecting to AI Agents](#connecting-to-ai-agents)
6. [Testing](#testing)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

Tressellate separates concerns into 5 layers. The bottom 3 are shared infrastructure. The top 2 are where you plug in your domain.

```
YOU BUILD THESE:
  Layer 5 — Application + Server (WHERE)     Your MCP tools + server
  Layer 4 — Domain Rules (WHY)               Your config, enums, schemas

PROVIDED BY TRESSELLATE:
  Layer 3 — Asset Types (WHAT)               7 primitives + 5 factories
  Layer 2 — Guardian Tools (WHO)             Identity + governance
  Layer 1 — Hashgraph Tools (HOW)            Hedera SDK wrappers
```

The key insight is **Layer 3**. It defines 7 universal schema primitives that can model any tokenized asset:

| Primitive | Represents | Example |
|-----------|-----------|---------|
| **Certificate** | A verified attestation | Crop yield cert, drug lot cert, quality cert |
| **Provenance** | Origin and custody chain | Parts provenance, supply chain step |
| **Credit** | A quantifiable unit of value | Renewable energy credit, carbon offset |
| **Agreement** | A multi-party contract | Lease, NDA, service agreement |
| **Inspection** | An evaluation result | Soil test, safety audit, quality assessment |
| **Milestone** | A progress marker | Payment received, phase completed |
| **Claim** | An assertion needing verification | Insurance claim, warranty claim |

Every domain-specific schema you create at Layer 4 is a composition of one of these primitives with domain-specific fields. This is what makes the system learnable by AI — the structural patterns are always the same.

---

## Understanding the Layers

### Layer 1: Hashgraph Tools (`core/hashgraph-tools/`)

Direct wrappers around the Hedera SDK. These are the raw building blocks:

- **Token operations**: create, mint, transfer, burn, associate
- **NFT operations**: create collection, mint, transfer, get info
- **Consensus**: create topic, submit message, get messages
- **Accounts**: create, get info
- **Queries**: balance, token info, transaction receipts

You rarely call these directly in a domain implementation. Instead, Layer 3 operation factories and Layer 5 tools compose them for you.

**Key exports:**
```typescript
import { createNFTCollection, mintNFT, getTopicMessages } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { HederaConfig, MCPTool } from '@tressellate/core/config';
```

### Layer 2: Guardian Tools (`core/guardian-tools/`)

Governance and identity through Hedera Guardian. Handles:

- Policy creation and publication
- Schema management
- Verifiable Credential issuance and verification
- Trust chain queries
- Role assignment within policy workflows

### Layer 3: Asset Types (`core/asset-types/`)

This is the normalization layer. It provides:

**7 Schema interfaces** — TypeScript types you compose into domain schemas:
```typescript
import type { CertificateSchema, ProvenanceSchema, CreditSchema } from '@tressellate/asset-types';
```

**5 Operation factories** — functions that create reusable tool implementations:
```typescript
import { createMintNFTAsset, createQueryAuditTrail } from '@tressellate/asset-types';
```

### Layer 4: Domain Rules (`examples/domains/*/`)

Your domain configuration. Three files:

1. **`config.ts`** — Extends `HederaConfig` with domain resource IDs
2. **`enums.ts`** — Domain-specific constants (categories, statuses, types)
3. **`schemas.ts`** — Domain schemas that compose Layer 3 primitives

### Layer 5: Application + Server (`examples/apps/*/` + `examples/servers/*/`)

Your MCP tools and server. The app package defines tools grouped by purpose:

- **Collection tools** — Create collections, mint/issue assets
- **Query tools** — Verify, search, inspect assets
- **Audit tools** — Query audit trail

The server package wires tools into an MCP server with stdio transport.

---

## The 5 Included Examples

### 1. Agriculture: Crop Yield Certificates

**Domain**: `examples/domains/agriculture/`
**App**: `examples/apps/crop-cert/`
**Server**: `examples/servers/crop-cert/`

Demonstrates: **Certificate + Inspection** primitives

A farm certifies crop yields as NFTs. Each certificate records the farm, field, crop variety, yield weight, harvest date, and certification standard (USDA Organic, EU Organic, GAP, etc.). Soil inspections can be linked as supporting evidence.

**Tools:**
| Tool | Action |
|------|--------|
| `crop_cert_create_collection` | One-time setup of the NFT collection |
| `crop_cert_issue` | Mint a crop yield certificate NFT |
| `crop_cert_verify` | Look up and verify a certificate by serial number |
| `crop_cert_list_by_farm` | List all certificates for a farm account |
| `crop_cert_get_audit` | Query the audit trail |

**AI agent workflow:**
> "Create a USDA Organic certificate for 2,500 kg of Jasmine Rice harvested from Farm F-201, Field A3"

The agent calls `crop_cert_issue` with the parameters, gets back a serial number and transaction ID, then can verify it with `crop_cert_verify`.

---

### 2. Real Estate: Lease Agreements

**Domain**: `examples/domains/real-estate/`
**App**: `examples/apps/lease/`
**Server**: `examples/servers/lease/`

Demonstrates: **Agreement + Milestone** primitives

Lease agreements are minted as NFTs and transferred to tenants. Payment milestones are recorded to the audit trail. Tenancy can be verified by checking NFT ownership.

**Tools:**
| Tool | Action |
|------|--------|
| `lease_create_collection` | Create the lease NFT collection |
| `lease_grant` | Mint a lease NFT and transfer to tenant (3-step: mint, transfer, audit) |
| `lease_verify_tenant` | Verify a tenant holds a valid lease |
| `lease_record_payment` | Record a rent payment to the audit trail |
| `lease_get_audit` | Query the lease audit trail |

---

### 3. Supply Chain: Parts Provenance

**Domain**: `examples/domains/supply-chain/`
**App**: `examples/apps/parts-prov/`
**Server**: `examples/servers/parts-prov/`

Demonstrates: **Provenance + Certificate** primitives

Manufacturing parts are tracked from origin through the supply chain. Each part gets a provenance NFT recording material type, manufacturer, batch, and origin. Quality certifications are recorded to the audit trail.

**Tools:**
| Tool | Action |
|------|--------|
| `parts_prov_create_collection` | Create the provenance NFT collection |
| `parts_prov_record` | Mint a provenance record for a part |
| `parts_prov_verify` | Verify a part's provenance by serial number |
| `parts_prov_certify_quality` | Record a quality certification to audit |
| `parts_prov_get_audit` | Query the provenance audit trail |

---

### 4. Energy: Renewable Energy Credits

**Domain**: `examples/domains/energy/`
**App**: `examples/apps/rec/`
**Server**: `examples/servers/rec/`

Demonstrates: **Credit (fungible) + Certificate (NFT)** primitives

RECs are issued as fungible tokens (1 token = 1 MWh). Generation certificates are minted as NFTs linking to the facility, energy source, and verification body. This is the only example that uses both fungible tokens and NFTs.

**Tools:**
| Tool | Action |
|------|--------|
| `rec_create_token` | Create the REC fungible token |
| `rec_create_cert_collection` | Create the generation certificate NFT collection |
| `rec_mint_credits` | Mint REC tokens (with audit trail) |
| `rec_issue_generation_cert` | Mint a generation certificate NFT |
| `rec_get_balance` | Query REC token balance for an account |
| `rec_get_audit` | Query the energy audit trail |

---

### 5. Healthcare: Drug Lot Certification

**Domain**: `examples/domains/healthcare/`
**App**: `examples/apps/drug-cert/`
**Server**: `examples/servers/drug-cert/`

Demonstrates: **Certificate + Provenance** primitives

Drug lots are certified with GMP compliance status, NDC codes, expiration dates, and storage conditions. Cold-chain custody transfers are recorded to the audit trail. Verification checks both GMP status and expiration.

**Tools:**
| Tool | Action |
|------|--------|
| `drug_cert_create_collection` | Create the drug certification NFT collection |
| `drug_cert_certify_lot` | Certify a drug lot (mint NFT with GMP/NDC metadata) |
| `drug_cert_verify_lot` | Verify a lot's certification, GMP status, and expiration |
| `drug_cert_record_shipment` | Record a custody transfer to the audit trail |
| `drug_cert_get_audit` | Query the drug certification audit trail |

---

## Step-by-Step: Build Your Own Domain

Let's build a fictional **"Timber Certification"** domain to demonstrate the pattern. This will issue certificates for sustainably harvested timber lots.

### Step 1: Create the Layer 4 Domain Package

```bash
mkdir -p examples/domains/forestry/src
```

**`examples/domains/forestry/package.json`:**
```json
{
  "name": "@tressellate/domain-forestry",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": { "build": "tsc" },
  "dependencies": {
    "@tressellate/core": "workspace:*",
    "@tressellate/asset-types": "workspace:*"
  }
}
```

**`examples/domains/forestry/tsconfig.json`:**
```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src/**/*"]
}
```

**`examples/domains/forestry/src/config.ts`:**
```typescript
import type { HederaConfig } from '@tressellate/core/config';

export interface ForestryConfig extends HederaConfig {
  /** NFT collection ID for timber certificates. */
  timberCertCollectionId?: string;
  /** HCS topic ID for forestry audit trail. */
  timberAuditTopicId?: string;
}
```

The config extends `HederaConfig` (which provides `network`, `operatorAccountId`, `operatorPrivateKey`, `supplyKey`, `mirrorNodeUrl`) with your domain-specific Hedera resource IDs.

**`examples/domains/forestry/src/enums.ts`:**
```typescript
export const TimberSpecies = [
  'OAK', 'PINE', 'MAPLE', 'CEDAR', 'TEAK', 'OTHER'
] as const;
export type TimberSpecies = (typeof TimberSpecies)[number];

export const SustainabilityStandard = [
  'FSC', 'PEFC', 'SFI', 'INTERNAL'
] as const;
export type SustainabilityStandard = (typeof SustainabilityStandard)[number];

export const ForestrySchemaType = [
  'TIMBER_CERT', 'HARVEST_INSPECTION'
] as const;
export type ForestrySchemaType = (typeof ForestrySchemaType)[number];
```

The `as const` + type extraction pattern gives you both runtime arrays (for validation) and compile-time types (for type checking).

**`examples/domains/forestry/src/schemas.ts`:**
```typescript
import type { TimberSpecies, SustainabilityStandard } from './enums.js';

/** Timber certificate metadata (composes Certificate primitive). */
export interface TimberCertSchema {
  type: 'TIMBER_CERT';
  forestId: string;
  plotId: string;
  species: TimberSpecies;
  volumeM3: number;
  harvestDate: string;
  standard: SustainabilityStandard;
  certifiedAt: string;
}
```

**`examples/domains/forestry/src/index.ts`:**
```typescript
export type { ForestryConfig } from './config.js';
export { TimberSpecies, SustainabilityStandard, ForestrySchemaType } from './enums.js';
export type { TimberCertSchema } from './schemas.js';
```

### Step 2: Create the Layer 5 Application Package

```bash
mkdir -p examples/apps/timber-cert/src/tools
```

**`examples/apps/timber-cert/package.json`:**
```json
{
  "name": "@tressellate/timber-cert",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": { "build": "tsc" },
  "dependencies": {
    "@tressellate/core": "workspace:*",
    "@tressellate/asset-types": "workspace:*",
    "@tressellate/domain-forestry": "workspace:*"
  }
}
```

**`examples/apps/timber-cert/src/config.ts`:**
```typescript
export type { ForestryConfig as TimberCertConfig } from '@tressellate/domain-forestry';
```

**`examples/apps/timber-cert/src/tools/collection.ts`:**
```typescript
import type { MCPTool } from '@tressellate/core/config';
import { createNFTCollection, mintNFT } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { TimberCertConfig } from '../config.js';

// Helper: throw if collection ID not configured
const requireCollectionId = requireConfigField<TimberCertConfig>(
  'timberCertCollectionId',
  'Timber cert collection not configured. Set HEDERA_TIMBER_CERT_COLLECTION_ID.'
);

// Helper: submit audit trail entries
const submitAudit = createAuditSubmitter<TimberCertConfig>(
  (config) => config.timberAuditTopicId,
  'timber-cert'
);

export const TIMBER_CERT_COLLECTION_TOOLS: MCPTool<TimberCertConfig>[] = [
  {
    name: 'timber_cert_create_collection',
    description: 'Creates the Timber Certificate NFT collection. One-time setup.',
    inputSchema: {
      type: 'object',
      properties: {
        tokenName: { type: 'string', default: 'Timber Certificates' },
        tokenSymbol: { type: 'string', default: 'TMBR' }
      },
      required: []
    },
    implementation: async (args, config) => {
      const result = await createNFTCollection(config, {
        tokenName: (args.tokenName as string) ?? 'Timber Certificates',
        tokenSymbol: (args.tokenSymbol as string) ?? 'TMBR'
      });
      await submitAudit(config, {
        event: 'COLLECTION_CREATED',
        tokenId: result.tokenId
      });
      return { ...result, message: `Store this token ID: ${result.tokenId}` };
    }
  },
  {
    name: 'timber_cert_issue',
    description: 'Issues a timber certificate by minting an NFT with harvest metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        forestId: { type: 'string', description: 'Forest identifier' },
        plotId: { type: 'string', description: 'Plot identifier' },
        species: { type: 'string', description: 'OAK, PINE, MAPLE, CEDAR, TEAK, OTHER' },
        volumeM3: { type: 'number', description: 'Harvest volume in cubic meters' },
        harvestDate: { type: 'string', description: 'Harvest date (ISO 8601)' },
        standard: { type: 'string', description: 'FSC, PEFC, SFI, INTERNAL' }
      },
      required: ['forestId', 'plotId', 'species', 'volumeM3', 'harvestDate', 'standard']
    },
    implementation: async (args, config) => {
      const collectionId = requireCollectionId(config);

      const metadata = JSON.stringify({
        type: 'TIMBER_CERT',
        forestId: args.forestId,
        plotId: args.plotId,
        species: args.species,
        volumeM3: args.volumeM3,
        harvestDate: args.harvestDate,
        standard: args.standard,
        certifiedAt: new Date().toISOString()
      });

      const result = await mintNFT(config, collectionId, [metadata]);
      const serialNumber = result.serialNumbers[0];

      await submitAudit(config, {
        event: 'TIMBER_CERTIFIED',
        forestId: args.forestId,
        species: args.species,
        volumeM3: args.volumeM3,
        serialNumber
      });

      return { success: true, serialNumber, transactionId: result.transactionId };
    }
  }
];
```

**`examples/apps/timber-cert/src/tools/index.ts`:**
```typescript
import { TIMBER_CERT_COLLECTION_TOOLS } from './collection.js';
// ... import query and audit tools the same way

export const TIMBER_CERT_TOOLS = [
  ...TIMBER_CERT_COLLECTION_TOOLS
  // ...TIMBER_CERT_QUERY_TOOLS,
  // ...TIMBER_CERT_AUDIT_TOOLS
];

export { TIMBER_CERT_COLLECTION_TOOLS };
```

### Step 3: Create the Layer 5 MCP Server

```bash
mkdir -p examples/servers/timber-cert/src
```

**`examples/servers/timber-cert/src/index.ts`:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import type { MCPTool } from '@tressellate/core/config';
import { HEDERA_TOOLS } from '@tressellate/core';
import { TIMBER_CERT_TOOLS, type TimberCertConfig } from '@tressellate/timber-cert';

const ALL_TOOLS: MCPTool<TimberCertConfig>[] = [
  ...(HEDERA_TOOLS as MCPTool<TimberCertConfig>[]),
  ...TIMBER_CERT_TOOLS
];

const config: TimberCertConfig = {
  network: (process.env.HEDERA_NETWORK as TimberCertConfig['network']) ?? 'testnet',
  operatorAccountId: process.env.HEDERA_OPERATOR_ID!,
  operatorPrivateKey: process.env.HEDERA_OPERATOR_KEY!,
  supplyKey: process.env.HEDERA_SUPPLY_KEY!,
  timberCertCollectionId: process.env.HEDERA_TIMBER_CERT_COLLECTION_ID,
  timberAuditTopicId: process.env.HEDERA_TIMBER_AUDIT_TOPIC_ID,
  mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL
};

const server = new Server(
  { name: 'Hedera Timber Cert MCP', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema
  }))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = ALL_TOOLS.find((t) => t.name === request.params.name);
  if (!tool) throw new Error(`Tool not found: ${request.params.name}`);

  try {
    const result = await tool.implementation(
      (request.params.arguments ?? {}) as Record<string, unknown>,
      config
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          tool: request.params.name,
          network: config.network
        }, null, 2)
      }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 4: Build and Run

```bash
bun install
cd examples/domains/forestry && bun run build
cd ../../apps/timber-cert && bun run build
cd ../../servers/timber-cert && bun run build

# Run the server
export HEDERA_NETWORK=testnet
export HEDERA_OPERATOR_ID=0.0.xxxxx
export HEDERA_OPERATOR_KEY=your-key
export HEDERA_SUPPLY_KEY=your-supply-key
bun run dev
```

---

## Connecting to AI Agents

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "timber-cert": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/timber-cert",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.xxxxx",
        "HEDERA_OPERATOR_KEY": "your-private-key",
        "HEDERA_SUPPLY_KEY": "your-supply-key"
      }
    }
  }
}
```

Claude will automatically discover all tools and can reason about them:

> **User**: "Certify 150 cubic meters of FSC-certified Oak timber from Forest FR-42, Plot B7, harvested today"
>
> **Claude**: *Calls `timber_cert_issue` with the parameters and returns the certificate serial number and transaction ID*

### Cursor / VS Code

Use the MCP extension with the same configuration pattern.

### Custom Agents

Any agent framework that supports MCP (LangChain, AutoGen, CrewAI) can connect via stdio transport.

---

## Testing

Run the existing test suite:

```bash
bun test
```

All 281 tests cover Layers 1-3 (core infrastructure). For your domain tools, write tests using Bun's test runner:

```typescript
import { describe, test, expect, mock } from 'bun:test';
import { TIMBER_CERT_COLLECTION_TOOLS } from '../src/tools/collection.js';

describe('timber_cert_issue', () => {
  test('requires all mandatory fields', () => {
    const tool = TIMBER_CERT_COLLECTION_TOOLS.find(
      (t) => t.name === 'timber_cert_issue'
    );
    expect(tool).toBeDefined();
    expect(tool!.inputSchema.required).toContain('forestId');
    expect(tool!.inputSchema.required).toContain('species');
  });
});
```

---

## Production Considerations

### Environment Variables

Every domain server needs these base variables plus domain-specific ones:

```env
# Required (all servers)
HEDERA_NETWORK=mainnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
HEDERA_SUPPLY_KEY=302e...

# Optional (all servers)
HEDERA_MIRROR_NODE_URL=https://mainnet.mirrornode.hedera.com

# Domain-specific (created via collection setup tools)
HEDERA_TIMBER_CERT_COLLECTION_ID=0.0.xxxxx
HEDERA_TIMBER_AUDIT_TOPIC_ID=0.0.xxxxx
```

### Security

- Never commit private keys. Use environment variables or a secrets manager.
- The `supplyKey` controls token minting — protect it accordingly.
- Consider using `HEDERA_NETWORK=testnet` during development.

### Scaling

- Each MCP server is a single process connected via stdio. For multi-user deployments, consider the streamable HTTP transport (on the roadmap).
- NFT collections have optional `maxSupply` limits. Plan capacity accordingly.
- HCS topics are append-only and provide natural audit immutability.

---

## What's Next

- **Add query and audit tools** following the patterns in the included examples
- **Write domain-specific validations** in your tool implementations
- **Compose multiple primitives** — the Energy (REC) example shows how to combine fungible tokens with NFT certificates
- **Explore Guardian integration** for governance workflows at Layer 2

For questions, issues, or contributions: [github.com/tressellate/tressellate](https://github.com/tressellate/tressellate)

---

Built by [bulKrete Technologies](https://bulkrete.com)
