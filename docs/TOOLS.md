# MCP Tool Inventory

Complete inventory of all 48 MCP tools across the Trellis MCP framework.

## Layer 1: Hashgraph Tools (`core/hashgraph-tools/`)

### Account Tools — `src/tools/account.ts`
| Tool Name | Description |
|-----------|-------------|
| `hedera_create_account` | Creates a new Hiero account with an ED25519 key pair |
| `hedera_get_account_info` | Gets Hiero account information via mirror node |

### Consensus Tools — `src/tools/consensus.ts`
| Tool Name | Description |
|-----------|-------------|
| `hedera_create_topic` | Creates a Hiero Consensus Service (HCS) topic |
| `hedera_submit_topic_message` | Submits a message to an HCS topic |
| `hedera_get_topic_messages` | Retrieves messages from an HCS topic via mirror node |

### NFT Tools — `src/tools/nft.ts`
| Tool Name | Description |
|-----------|-------------|
| `hedera_create_nft_collection` | Creates an NFT collection on Hiero Token Service |
| `hedera_mint_nft` | Mints one or more NFTs in a collection |
| `hedera_transfer_nft` | Transfers a specific NFT between two Hiero accounts |
| `hedera_burn_nft` | Burns specific NFTs by serial number |
| `hedera_get_nft_info` | Gets detailed info about a specific NFT |
| `hedera_get_account_nfts` | Lists all NFTs held by a Hiero account |
| `contract_verify_holder` | Verifies whether an account holds a valid contract NFT |

### Query Tools — `src/tools/query.ts`
| Tool Name | Description |
|-----------|-------------|
| `hedera_get_token_balance` | Gets token balance for an account via mirror node |
| `hedera_get_token_transaction_history` | Gets token transaction history via mirror node |
| `hedera_get_token_info` | Gets token statistics (name, symbol, supply) |
| `hedera_check_token_association` | Checks if account has associated a token |
| `hedera_get_transaction_receipt` | Gets receipt for any Hiero transaction |

### Token Tools — `src/tools/token.ts`
| Tool Name | Description |
|-----------|-------------|
| `hedera_create_token` | Creates a fungible token on Hiero Token Service |
| `hedera_mint_token` | Mints additional supply of a fungible token |
| `hedera_transfer_token` | Transfers tokens between two Hiero accounts |
| `hedera_burn_token` | Burns tokens from the treasury account |
| `hedera_associate_token` | Associates a token with a Hiero account |

**Subtotal: 22 tools**

---

## Layer 5: Crop Certification (`examples/apps/crop-cert/`)

Domain: Agriculture | Primitives: Certificate + Inspection

| Tool Name | Description |
|-----------|-------------|
| `crop_cert_create_collection` | Creates the crop certificate NFT collection |
| `crop_cert_issue` | Issues a crop yield certificate NFT with harvest metadata |
| `crop_cert_verify` | Verifies a crop certificate by serial number |
| `crop_cert_list_by_farm` | Lists all certificates for a farm account |
| `crop_cert_get_audit` | Retrieves the crop certification audit trail |

**Subtotal: 5 tools**

---

## Layer 5: Lease Management (`examples/apps/lease/`)

Domain: Real Estate | Primitives: Agreement + Milestone

| Tool Name | Description |
|-----------|-------------|
| `lease_create_collection` | Creates the lease agreement NFT collection |
| `lease_grant` | Mints a lease NFT and transfers to tenant (3-step: mint, transfer, audit) |
| `lease_verify_tenant` | Verifies a tenant holds a valid lease NFT |
| `lease_record_payment` | Records a rent payment milestone to the audit trail |
| `lease_get_audit` | Retrieves the lease audit trail |

**Subtotal: 5 tools**

---

## Layer 5: Parts Provenance (`examples/apps/parts-prov/`)

Domain: Supply Chain | Primitives: Provenance + Certificate

| Tool Name | Description |
|-----------|-------------|
| `parts_prov_create_collection` | Creates the parts provenance NFT collection |
| `parts_prov_record` | Records a part's provenance as an NFT with material/origin metadata |
| `parts_prov_verify` | Verifies a part's provenance by serial number |
| `parts_prov_certify_quality` | Records a quality certification to the audit trail |
| `parts_prov_get_audit` | Retrieves the parts provenance audit trail |

**Subtotal: 5 tools**

---

## Layer 5: Renewable Energy Credits (`examples/apps/rec/`)

Domain: Energy | Primitives: Credit (fungible) + Certificate (NFT)

| Tool Name | Description |
|-----------|-------------|
| `rec_create_token` | Creates the REC fungible token |
| `rec_create_cert_collection` | Creates the generation certificate NFT collection |
| `rec_mint_credits` | Mints REC tokens with audit trail (1 token = 1 MWh) |
| `rec_issue_generation_cert` | Issues a generation certificate NFT linking facility and energy source |
| `rec_get_balance` | Queries REC token balance for an account |
| `rec_get_audit` | Retrieves the energy audit trail |

**Subtotal: 6 tools**

---

## Layer 5: Drug Lot Certification (`examples/apps/drug-cert/`)

Domain: Healthcare | Primitives: Certificate + Provenance

| Tool Name | Description |
|-----------|-------------|
| `drug_cert_create_collection` | Creates the drug certification NFT collection |
| `drug_cert_certify_lot` | Certifies a drug lot with GMP compliance, NDC code, and storage conditions |
| `drug_cert_verify_lot` | Verifies a lot's certification, GMP status, and expiration |
| `drug_cert_record_shipment` | Records a cold-chain custody transfer to the audit trail |
| `drug_cert_get_audit` | Retrieves the drug certification audit trail |

**Subtotal: 5 tools**

---

## Summary

| Package | Layer | Location | Tools |
|---------|-------|----------|-------|
| `@trellis-mcp/core` | 1 (Hashgraph) | `core/hashgraph-tools/` | 22 |
| `@trellis-mcp/guardian-tools` | 2 (Guardian) | `core/guardian-tools/` | 0 (GovernanceProvider interface) |
| `@trellis-mcp/asset-types` | 3 (Asset Types) | `core/asset-types/` | 0 (schemas + factories) |
| `@trellis-mcp/crop-cert` | 5 (Agriculture) | `examples/apps/crop-cert/` | 5 |
| `@trellis-mcp/lease` | 5 (Real Estate) | `examples/apps/lease/` | 5 |
| `@trellis-mcp/parts-prov` | 5 (Supply Chain) | `examples/apps/parts-prov/` | 5 |
| `@trellis-mcp/rec` | 5 (Energy) | `examples/apps/rec/` | 6 |
| `@trellis-mcp/drug-cert` | 5 (Healthcare) | `examples/apps/drug-cert/` | 5 |
| **Total** | | | **48** |

> Note: Layer 2 (Guardian Tools) provides the `GovernanceProvider` interface and `NoopGovernanceProvider` class but no MCP tools yet. Layer 3 (Asset Types) provides 7 schema primitives and 5 operation factories consumed by Layer 5 tools. Layer 4 (Domain Rules) packages contain domain configuration, enums, and schemas but no MCP tools.
