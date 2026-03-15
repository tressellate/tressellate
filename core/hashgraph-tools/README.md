# @tressellate/core

**Layer 1 — Infrastructure Primitives for Hiero (formerly Hedera Hashgraph)**

This package provides 22 MCP tools and composable functions for direct interaction with the Hiero network. These are the foundational building blocks that every Hiero application needs.

## What This Layer Does

Hashgraph tools handle ledger-level operations: creating accounts, managing tokens and NFTs, submitting consensus messages, and querying network state. They provide a clean, typed interface between AI agents (via MCP) and Hiero's distributed ledger.

## What This Layer Does NOT Do

This layer has no knowledge of governance workflows or domain-specific logic. It interacts only with the Hiero network. For governance, use `@tressellate/guardian-tools` (Layer 2). For asset abstractions, use `@tressellate/asset-types` (Layer 3).

## Tools (22)

### Account Tools — `src/tools/account.ts`
| Tool | Description |
|------|-------------|
| `hedera_create_account` | Creates a new Hiero account with an ED25519 key pair |
| `hedera_get_account_info` | Gets Hiero account information via mirror node |

### Token Tools — `src/tools/token.ts`
| Tool | Description |
|------|-------------|
| `hedera_create_token` | Creates a fungible token on Hiero Token Service |
| `hedera_mint_token` | Mints additional supply of a fungible token |
| `hedera_transfer_token` | Transfers tokens between two Hiero accounts |
| `hedera_burn_token` | Burns tokens from the treasury account |
| `hedera_associate_token` | Associates a token with a Hiero account |

### NFT Tools — `src/tools/nft.ts`
| Tool | Description |
|------|-------------|
| `hedera_create_nft_collection` | Creates an NFT collection on Hiero Token Service |
| `hedera_mint_nft` | Mints one or more NFTs in a collection |
| `hedera_transfer_nft` | Transfers a specific NFT between two Hiero accounts |
| `hedera_burn_nft` | Burns specific NFTs by serial number |
| `hedera_get_nft_info` | Gets detailed info about a specific NFT |
| `hedera_get_account_nfts` | Lists all NFTs held by a Hiero account |
| `contract_verify_holder` | Verifies whether an account holds a valid contract NFT |

### Consensus Tools — `src/tools/consensus.ts`
| Tool | Description |
|------|-------------|
| `hedera_create_topic` | Creates a Hiero Consensus Service (HCS) topic |
| `hedera_submit_topic_message` | Submits a message to an HCS topic |
| `hedera_get_topic_messages` | Retrieves messages from an HCS topic via mirror node |

### Query Tools — `src/tools/query.ts`
| Tool | Description |
|------|-------------|
| `hedera_get_token_balance` | Gets token balance for an account via mirror node |
| `hedera_get_token_transaction_history` | Gets token transaction history via mirror node |
| `hedera_get_token_info` | Gets token statistics (name, symbol, supply) |
| `hedera_check_token_association` | Checks if account has associated a token |
| `hedera_get_transaction_receipt` | Gets receipt for any Hiero transaction |

## Usage

### MCP Integration

Register all tools with an MCP server:

```typescript
import { HEDERA_TOOLS, type HederaConfig, type MCPTool } from '@tressellate/core';

const config: HederaConfig = {
  network: 'testnet',
  operatorAccountId: '0.0.xxxxx',
  operatorPrivateKey: 'your-private-key',
  supplyKey: 'your-supply-key',
};

// HEDERA_TOOLS is an MCPTool<HederaConfig>[] — register all 22 at once
for (const tool of HEDERA_TOOLS) {
  server.tool(tool.name, tool.inputSchema, (args) => tool.implementation(args, config));
}
```

Or register tools by category:

```typescript
import { HEDERA_TOKEN_TOOLS, HEDERA_NFT_TOOLS } from '@tressellate/core';
```

### Composable Functions

Every tool is also available as a standalone async function for direct use by higher layers:

```typescript
import {
  createTopic,
  submitTopicMessage,
  getTopicMessages,
  createNFTCollection,
  mintNFT,
  getNFTInfo,
  type HederaConfig,
} from '@tressellate/core';

// Create a consensus topic
const topic = await createTopic(config, {
  memo: 'audit-trail',
  submitKey: true,
});

// Mint an NFT with structured metadata
const nft = await mintNFT(config, {
  tokenId: collectionId,
  metadata: [JSON.stringify({ certType: 'yield', farmId: 'F-001' })],
});

// Query NFT details
const info = await getNFTInfo(config, {
  tokenId: collectionId,
  serialNumber: nft.serialNumbers[0],
});
```

### Helpers

```typescript
import { createAuditSubmitter, requireConfigField } from '@tressellate/core';

// Create a reusable audit submission function
const submitAudit = createAuditSubmitter(config, topicId);

// Validate required config fields with actionable errors
const collectionId = requireConfigField(config, 'cropCertCollectionId');
```

## Configuration

```typescript
interface HederaConfig {
  network: 'testnet' | 'previewnet' | 'mainnet';
  operatorAccountId: string;
  operatorPrivateKey: string;
  supplyKey: string;
  mirrorNodeUrl?: string;
}
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `network` | Yes | `mainnet`, `testnet`, or `previewnet` |
| `operatorAccountId` | Yes | Hiero account ID (0.0.xxxxx) |
| `operatorPrivateKey` | Yes | Account private key for signing transactions |
| `supplyKey` | Yes | Key for minting tokens and NFTs |
| `mirrorNodeUrl` | No | Custom mirror node URL (defaults per network) |

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `HEDERA_TOOLS` | `MCPTool[]` | All 22 tools |
| `HEDERA_TOKEN_TOOLS` | `MCPTool[]` | 5 token tools |
| `HEDERA_NFT_TOOLS` | `MCPTool[]` | 7 NFT tools |
| `HEDERA_ACCOUNT_TOOLS` | `MCPTool[]` | 2 account tools |
| `HEDERA_CONSENSUS_TOOLS` | `MCPTool[]` | 3 consensus tools |
| `HEDERA_QUERY_TOOLS` | `MCPTool[]` | 5 query tools |
| `buildClient` | Function | Creates a configured Hiero SDK client |
| `MIRROR_NODE_URLS` | Constant | Mirror node URLs per network |
| `MCPTool<TConfig>` | Interface | Tool definition shape |
| `HederaConfig` | Interface | Configuration shape |

## License

Apache License 2.0
