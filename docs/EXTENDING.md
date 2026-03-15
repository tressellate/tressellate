# Extending Tressellate

This guide walks through creating a new domain-specific tool package that composes on top of `@tressellate/core`. By the end you will have a working package with typed config, composable tools, an MCP server, and an audit trail — following the exact patterns used by the included domain examples (crop-cert, lease, parts-prov, rec, drug-cert).

> **Note:** For a more comprehensive guide that covers the full 5-layer architecture (including Layer 3 asset types and Layer 4 domain rules), see [GUIDE.md](./GUIDE.md). This document covers the simplified 2-layer approach (core + domain package) for projects that don't need the full Layer 3/4 normalization.

## Table of Contents

1. [How It Works](#how-it-works)
2. [Step 1: Scaffold the Package](#step-1-scaffold-the-package)
3. [Step 2: Define Your Config](#step-2-define-your-config)
4. [Step 3: Write Tools](#step-3-write-tools)
5. [Step 4: Create the Barrel Exports](#step-4-create-the-barrel-exports)
6. [Step 5: Create the MCP Server](#step-5-create-the-mcp-server)
7. [Step 6: Build and Test](#step-6-build-and-test)
8. [Patterns Reference](#patterns-reference)
9. [Worked Example: Escrow Package](#worked-example-escrow-package)

---

## How It Works

The monorepo has three layers:

```
┌─────────────────────────────────────────┐
│  MCP Servers (thin composition points)  │  examples/servers/yourproject/
│  Import tools → build config → stdio    │
├─────────────────────────────────────────┤
│  Domain Packages (your business logic)  │  examples/apps/yourproject/
│  Compose core functions into workflows  │
├─────────────────────────────────────────┤
│  Core Package (generic Hedera ops)      │  core/hashgraph-tools/
│  Tokens, NFTs, accounts, HCS, queries   │
└─────────────────────────────────────────┘
```

**Key principle**: Domain packages never call the Hedera SDK directly. They import composable functions from `@tressellate/core` and orchestrate them into multi-step workflows.

### What Core Gives You

These composable functions are importable from `@tressellate/core`:

**Fungible Tokens** (`@tressellate/core/tools/token`):
- `createToken(config, opts)` — create a fungible token
- `mintToken(config, tokenId, amount)` — mint to treasury
- `transferToken(config, tokenId, from, to, amount)` — transfer between accounts
- `burnToken(config, tokenId, amount)` — burn from treasury
- `associateToken(config, tokenId, accountId, privateKey?)` — associate before receiving

**NFTs** (`@tressellate/core/tools/nft`):
- `createNFTCollection(config, opts)` — create NFT collection
- `mintNFT(config, tokenId, metadata[])` — mint with metadata, returns serial numbers
- `transferNFT(config, tokenId, from, to, serial)` — transfer by serial
- `burnNFT(config, tokenId, serials[])` — burn serials from treasury
- `getNFTInfo(config, tokenId, serial)` — query NFT metadata via mirror node
- `getAccountNFTs(config, accountId, tokenId?)` — list account NFTs

**Accounts** (`@tressellate/core/tools/account`):
- `createAccount(config, opts)` — create ED25519 account
- `getAccountInfo(config, accountId)` — query via mirror node

**Consensus / Audit** (`@tressellate/core/tools/consensus`):
- `createTopic(config, opts)` — create HCS topic
- `submitTopicMessage(config, topicId, message)` — submit JSON message
- `getTopicMessages(config, topicId, filters?)` — read messages

**Queries** (`@tressellate/core/tools/query`):
- `getTokenBalance(config, tokenId, accountId)`
- `getTokenInfo(config, tokenId)`
- `getTokenTransactionHistory(config, tokenId, accountId?)`
- `checkTokenAssociation(config, tokenId, accountId)`
- `getTransactionReceipt(config, transactionId)`

---

## Step 1: Scaffold the Package

Create the directory structure:

```
examples/apps/yourproject/
├── package.json
├── tsconfig.json
└── src/
    ├── config.ts
    ├── index.ts
    └── tools/
        ├── index.ts
        └── (your tool files)
```

### package.json

```json
{
  "name": "@tressellate/yourproject",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./config": { "types": "./dist/config.d.ts", "import": "./dist/config.js" }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@tressellate/core": "workspace:*",
    "@hashgraph/sdk": "^2.50.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Then run `bun install` from the monorepo root to link the workspace.

---

## Step 2: Define Your Config

Every domain package extends `HederaConfig` with its own fields. These are typically Hedera resource IDs created at setup time.

### `src/config.ts`

```typescript
import type { HederaConfig } from '@tressellate/core/config';

export interface YourProjectConfig extends HederaConfig {
  // Resource IDs created during setup (stored in .env)
  yourTokenId?: string;       // Set via YOUR_TOKEN_ID env var
  yourAuditTopicId?: string;  // Set via YOUR_AUDIT_TOPIC_ID env var
}
```

**Convention**: Fields are optional (`?`) because they don't exist until you create the resources with the tools. Guard access with a `require*` helper (see Step 3).

---

## Step 3: Write Tools

Each tool file follows the **dual-export pattern**: composable functions + MCPTool array.

### Tool File Template

```typescript
// examples/apps/yourproject/src/tools/operations.ts

import type { MCPTool } from '@tressellate/core/config';
import { mintToken, transferToken } from '@tressellate/core/tools/token';
import { submitTopicMessage } from '@tressellate/core/tools/consensus';
import type { YourProjectConfig } from '../config.js';

// ─── Helper: Config Validator ───────────────────────────
// Throws a clear error if the required resource ID is not set.

function requireTokenId(config: YourProjectConfig): string {
  if (!config.yourTokenId) {
    throw new Error(
      'Token ID not configured. Run yourproject_create_token first, ' +
      'then set YOUR_TOKEN_ID in .env'
    );
  }
  return config.yourTokenId;
}

// ─── Helper: Audit Wrapper ──────────────────────────────
// Conditionally submits an audit message if topic is configured.

async function submitAudit(
  config: YourProjectConfig,
  message: Record<string, unknown>
) {
  if (!config.yourAuditTopicId) return { consensusTimestamp: null };
  return submitTopicMessage(config, config.yourAuditTopicId, {
    ...message,
    timestamp: new Date().toISOString(),
    network: config.network,
    domain: 'yourproject'
  });
}

// ─── Tools ──────────────────────────────────────────────

export const YOUR_OPERATION_TOOLS: MCPTool<YourProjectConfig>[] = [
  {
    name: 'yourproject_do_something',
    description: 'Describe what this tool does — Claude reads this to decide when to use it.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        recipientAccountId: {
          type: 'string',
          description: 'Hedera account ID (0.0.xxxxx)'
        },
        amount: {
          type: 'number',
          description: 'Amount in whole units'
        }
      },
      required: ['recipientAccountId', 'amount']
    },
    implementation: async (args, config) => {
      const tokenId = requireTokenId(config);
      const recipientAccountId = args.recipientAccountId as string;
      const amount = args.amount as number;

      // Step 1: Mint to treasury
      const mintResult = await mintToken(config, tokenId, amount * 100);

      // Step 2: Transfer to recipient
      const transferResult = await transferToken(
        config, tokenId,
        config.operatorAccountId, recipientAccountId,
        amount * 100
      );

      // Step 3: Record audit trail
      const auditResult = await submitAudit(config, {
        event: 'TOKENS_ISSUED',
        recipientAccountId,
        amount,
        mintTransactionId: mintResult.transactionId,
        transferTransactionId: transferResult.transactionId
      });

      return {
        success: true,
        mintTransactionId: mintResult.transactionId,
        transferTransactionId: transferResult.transactionId,
        auditConsensusTimestamp: auditResult.consensusTimestamp,
        recipientAccountId,
        amount
      };
    }
  }
];
```

### Key Patterns in Tool Files

**1. Config validator** — Always provide a `requireXxxId()` function:
```typescript
function requireTokenId(config: YourProjectConfig): string {
  if (!config.yourTokenId) throw new Error('Token ID not configured...');
  return config.yourTokenId;
}
```

**2. Audit wrapper** — Gracefully skip if topic not configured:
```typescript
async function submitAudit(config, message) {
  if (!config.yourAuditTopicId) return { consensusTimestamp: null };
  return submitTopicMessage(config, config.yourAuditTopicId, { ...message });
}
```

**3. Multi-step composition** — The core value of domain tools:
```typescript
// Step 1: core operation
const mintResult = await mintToken(config, tokenId, amount);
// Step 2: another core operation
const transferResult = await transferToken(config, tokenId, from, to, amount);
// Step 3: audit trail
const auditResult = await submitAudit(config, { event: '...', ...context });
```

**4. Amount conversion** — Hedera tokens use smallest unit (like cents):
```typescript
// If your token has 2 decimals, convert: 25.00 → 2500
const rawAmount = amount * Math.pow(10, decimals);
```

**5. Input schema** — JSON Schema format. Claude uses `description` fields to understand parameters:
```typescript
inputSchema: {
  type: 'object' as const,
  properties: {
    accountId: { type: 'string', description: 'Hedera account (0.0.xxxxx)' },
    amount:    { type: 'number', description: 'Amount in whole units' }
  },
  required: ['accountId', 'amount']
}
```

### Organizing Tool Files

Group tools by domain concern:

```
tools/
├── token.ts       # Token lifecycle (create, mint, transfer, burn)
├── account.ts     # Account management (create, associate)
├── query.ts       # Read-only mirror node queries
├── audit.ts       # Audit trail operations
└── index.ts       # Barrel export
```

Each file exports a typed array: `MCPTool<YourProjectConfig>[]`.

---

## Step 4: Create the Barrel Exports

### `src/tools/index.ts`

```typescript
import { YOUR_TOKEN_TOOLS } from './token.js';
import { YOUR_QUERY_TOOLS } from './query.js';
import { YOUR_AUDIT_TOOLS } from './audit.js';
import type { MCPTool } from '@tressellate/core/config';
import type { YourProjectConfig } from '../config.js';

export const YOURPROJECT_TOOLS: MCPTool<YourProjectConfig>[] = [
  ...YOUR_TOKEN_TOOLS,
  ...YOUR_QUERY_TOOLS,
  ...YOUR_AUDIT_TOOLS
];

export { YOUR_TOKEN_TOOLS, YOUR_QUERY_TOOLS, YOUR_AUDIT_TOOLS };
```

### `src/index.ts`

```typescript
export { type YourProjectConfig } from './config.js';
export { YOURPROJECT_TOOLS } from './tools/index.js';
```

---

## Step 5: Create the MCP Server

Servers live in `examples/servers/yourproject/` and are thin composition points.

### Directory structure

```
examples/servers/yourproject/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

### `package.json`

```json
{
  "name": "yourproject-mcp-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "bun src/index.ts"
  },
  "dependencies": {
    "@tressellate/core": "workspace:*",
    "@tressellate/yourproject": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### `src/index.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { MCPTool } from '@tressellate/core/config';
import { HEDERA_TOOLS } from '@tressellate/core';
import { YOURPROJECT_TOOLS, type YourProjectConfig } from '@tressellate/yourproject';

// ─── Compose tool arrays ────────────────────────────────
const ALL_TOOLS: MCPTool<YourProjectConfig>[] = [
  ...(HEDERA_TOOLS as MCPTool<YourProjectConfig>[]),
  ...YOURPROJECT_TOOLS
];

// ─── Load config from environment ───────────────────────
const config: YourProjectConfig = {
  network: (process.env.HEDERA_NETWORK as YourProjectConfig['network']) ?? 'testnet',
  operatorAccountId: process.env.HEDERA_OPERATOR_ID!,
  operatorPrivateKey: process.env.HEDERA_OPERATOR_KEY!,
  supplyKey: process.env.HEDERA_SUPPLY_KEY!,
  yourTokenId: process.env.YOUR_TOKEN_ID || undefined,
  yourAuditTopicId: process.env.YOUR_AUDIT_TOPIC_ID || undefined,
  mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL || undefined
};

// ─── MCP Server ─────────────────────────────────────────
const server = new Server(
  { name: 'Hedera YourProject MCP', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = ALL_TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Tool not found: ${request.params.name}`);
  }

  try {
    const result = await tool.implementation(
      (request.params.arguments ?? {}) as Record<string, unknown>,
      config
    );
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
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

### Register in root `package.json`

Add a dev script:

```json
"dev:yourproject": "bun examples/servers/yourproject/src/index.ts"
```

### Add env vars to `.env.example`

```env
# YourProject server
YOUR_TOKEN_ID=
YOUR_AUDIT_TOPIC_ID=
```

---

## Step 6: Build and Test

```bash
# From monorepo root
bun install                    # Link new workspace packages
bun run build                  # Build all packages

# Run the server
bun examples/servers/yourproject/src/index.ts
```

### Claude Desktop / Claude Code config

```json
{
  "mcpServers": {
    "hedera-yourproject": {
      "command": "bun",
      "args": ["/path/to/tressellate/examples/servers/yourproject/src/index.ts"]
    }
  }
}
```

---

## Patterns Reference

### Pattern 1: Config Extension

Every domain extends the base config. The generic `MCPTool<TConfig>` ensures type safety flows through.

```typescript
// Core defines the base
interface HederaConfig {
  network: 'testnet' | 'previewnet' | 'mainnet';
  operatorAccountId: string;
  operatorPrivateKey: string;
  supplyKey: string;
  mirrorNodeUrl?: string;
}

// Domain extends it
interface YourConfig extends HederaConfig {
  yourTokenId?: string;
  yourAuditTopicId?: string;
}

// Tools are typed to the domain config
const tools: MCPTool<YourConfig>[] = [...]
```

### Pattern 2: Composition (Multi-Step Workflows)

Domain tools compose core functions into business workflows. This is the primary value — Claude calls one domain tool that executes multiple Hedera transactions atomically.

```
rec_mint_credits = mintToken() + submitTopicMessage()
lease_grant = mintNFT() + transferNFT() + submitTopicMessage()
crop_cert_issue = mintNFT() + submitTopicMessage()
```

### Pattern 3: Audit Trail

Every mutating domain tool records an audit event to HCS. The pattern:

```typescript
const auditResult = await submitAudit(config, {
  event: 'YOUR_EVENT_NAME',        // e.g., TOKENS_ISSUED, ACCESS_GRANTED
  // Include all relevant context:
  recipientAccountId,
  amount,
  transactionIds: { mint: '...', transfer: '...' },
  referenceId                       // External system reference
});
```

Audit messages are immutable on Hedera Consensus Service and queryable via mirror node.

### Pattern 4: Fungible Token Domain (like REC)

Use when your domain tracks balances, points, credits, or currency.

Core functions you'll compose:
- `createToken()` — one-time setup
- `mintToken()` — increase supply
- `transferToken()` — move between accounts
- `burnToken()` — reduce supply
- `associateToken()` — required before receiving

### Pattern 5: NFT Domain (like Crop Cert or Drug Cert)

Use when your domain needs unique, non-interchangeable items (certificates, provenance records, agreements).

Core functions you'll compose:
- `createNFTCollection()` — one-time setup
- `mintNFT(metadata[])` — create unique items with JSON metadata
- `transferNFT(serial)` — transfer specific items
- `burnNFT(serials[])` — destroy specific items
- `getNFTInfo(serial)` — read decoded metadata
- `getAccountNFTs(accountId)` — list holdings

NFT metadata is stored as base64-encoded JSON on-chain. The `getNFTInfo` function automatically decodes it.

### Pattern 6: Mixed Domain

Your package can compose both fungible and NFT operations. Import from both:

```typescript
import { mintToken, transferToken } from '@tressellate/core/tools/token';
import { mintNFT, transferNFT } from '@tressellate/core/tools/nft';
import { submitTopicMessage } from '@tressellate/core/tools/consensus';
```

---

## Worked Example: Escrow Package

Here's a complete example of a hypothetical escrow package that uses fungible tokens for payments and HCS for audit.

### Config

```typescript
// examples/apps/escrow/src/config.ts
import type { HederaConfig } from '@tressellate/core/config';

export interface EscrowConfig extends HederaConfig {
  escrowTokenId?: string;
  escrowAuditTopicId?: string;
}
```

### Tool: Create Escrow

```typescript
// examples/apps/escrow/src/tools/escrow.ts
import type { MCPTool } from '@tressellate/core/config';
import { mintToken, transferToken } from '@tressellate/core/tools/token';
import { submitTopicMessage } from '@tressellate/core/tools/consensus';
import type { EscrowConfig } from '../config.js';

function requireEscrowTokenId(config: EscrowConfig): string {
  if (!config.escrowTokenId) {
    throw new Error('Escrow token not configured. Run escrow_create_token first.');
  }
  return config.escrowTokenId;
}

async function submitEscrowAudit(
  config: EscrowConfig,
  message: Record<string, unknown>
) {
  if (!config.escrowAuditTopicId) return { consensusTimestamp: null };
  return submitTopicMessage(config, config.escrowAuditTopicId, {
    ...message,
    timestamp: new Date().toISOString(),
    network: config.network,
    domain: 'escrow'
  });
}

export const ESCROW_TOOLS: MCPTool<EscrowConfig>[] = [
  {
    name: 'escrow_fund',
    description:
      'Fund an escrow by minting tokens and holding them in the operator treasury. ' +
      'Records the escrow creation on the audit trail with a reference ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'number',
          description: 'Escrow amount in whole units'
        },
        contractId: {
          type: 'string',
          description: 'External contract reference ID'
        },
        payerAccountId: {
          type: 'string',
          description: 'Account funding the escrow (0.0.xxxxx)'
        }
      },
      required: ['amount', 'contractId', 'payerAccountId']
    },
    implementation: async (args, config) => {
      const tokenId = requireEscrowTokenId(config);
      const amount = args.amount as number;
      const contractId = args.contractId as string;
      const payerAccountId = args.payerAccountId as string;

      // Step 1: Mint escrow tokens to treasury
      const mintResult = await mintToken(config, tokenId, amount * 100);

      // Step 2: Record escrow creation
      const auditResult = await submitEscrowAudit(config, {
        event: 'ESCROW_FUNDED',
        contractId,
        payerAccountId,
        amount,
        mintTransactionId: mintResult.transactionId,
        status: 'HELD'
      });

      return {
        success: true,
        escrowId: `ESC-${contractId}-${Date.now()}`,
        mintTransactionId: mintResult.transactionId,
        auditConsensusTimestamp: auditResult.consensusTimestamp,
        amount,
        status: 'HELD'
      };
    }
  },
  {
    name: 'escrow_release',
    description:
      'Release escrowed funds to the recipient account. ' +
      'Transfers tokens from treasury to the recipient and records the release.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        recipientAccountId: {
          type: 'string',
          description: 'Account to release funds to (0.0.xxxxx)'
        },
        amount: {
          type: 'number',
          description: 'Amount to release in whole units'
        },
        escrowId: {
          type: 'string',
          description: 'Escrow reference ID from escrow_fund'
        }
      },
      required: ['recipientAccountId', 'amount', 'escrowId']
    },
    implementation: async (args, config) => {
      const tokenId = requireEscrowTokenId(config);
      const recipientAccountId = args.recipientAccountId as string;
      const amount = args.amount as number;
      const escrowId = args.escrowId as string;

      // Step 1: Transfer from treasury to recipient
      const transferResult = await transferToken(
        config, tokenId,
        config.operatorAccountId, recipientAccountId,
        amount * 100
      );

      // Step 2: Record release
      const auditResult = await submitEscrowAudit(config, {
        event: 'ESCROW_RELEASED',
        escrowId,
        recipientAccountId,
        amount,
        transferTransactionId: transferResult.transactionId,
        status: 'RELEASED'
      });

      return {
        success: true,
        escrowId,
        transferTransactionId: transferResult.transactionId,
        auditConsensusTimestamp: auditResult.consensusTimestamp,
        recipientAccountId,
        amount,
        status: 'RELEASED'
      };
    }
  }
];
```

### Barrel + Server

Follow Steps 4 and 5 identically. The server imports `HEDERA_TOOLS + ESCROW_TOOLS`, builds an `EscrowConfig` from env vars, and connects via stdio.

---

## Checklist

When creating a new domain package, verify:

- [ ] `examples/apps/yourproject/package.json` has `"@tressellate/core": "workspace:*"`
- [ ] `tsconfig.json` extends `../../../tsconfig.base.json`
- [ ] Config interface extends `HederaConfig`
- [ ] All tool arrays are typed `MCPTool<YourConfig>[]`
- [ ] `requireXxxId()` helper validates required resource IDs
- [ ] `submitAudit()` helper gracefully skips if topic not configured
- [ ] All tools have `name`, `description`, `inputSchema`, and `implementation`
- [ ] Barrel `tools/index.ts` exports a single combined array
- [ ] Package `index.ts` exports config type + tools array
- [ ] Server in `examples/servers/yourproject/` composes `HEDERA_TOOLS + YOUR_TOOLS`
- [ ] Server reads config from `process.env`
- [ ] Root `package.json` has `dev:yourproject` script
- [ ] `.env.example` updated with new env vars
- [ ] `bun install && bun run build` passes with zero errors
