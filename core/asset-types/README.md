# @trellis-mcp/asset-types

**Layer 3 — Universal Asset Primitives for Tokenized Assets**

This package provides 7 schema primitives and 5 operation factories that normalize all on-chain assets into a finite, learnable vocabulary. An AI agent learns these 7 structural patterns once and can reason about any domain — crop certificates and drug lot certifications are both `Certificate` assets with the same shape.

## What This Layer Does

Asset types sit between infrastructure (Layer 1) and domain logic (Layers 4-5). They answer "what kind of asset is this?" without knowing which domain it belongs to. A `Certificate` is a `Certificate` whether it certifies a crop yield or a drug lot.

The operation factories provide reusable higher-order functions that encapsulate common patterns — mint an NFT with metadata and audit, query audit trails, manage agreement lifecycles — so domain tools don't reimplement the same logic.

## What This Layer Does NOT Do

This layer has no domain-specific knowledge. It doesn't know about agriculture, energy, or healthcare. Domain schemas and constraints live in Layer 4. Tool implementations live in Layer 5.

## Schema Primitives (7)

### Certificate

Verifiable attestation that something meets a defined standard.

- **Ledger mapping:** NFT (unique, non-fungible)
- **Lifecycle:** DRAFT → ISSUED → ACTIVE → EXPIRED | REVOKED
- **Use cases:** Crop yields, drug lots, quality certifications, GMP compliance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `issuerId` | string | No | Who issued the certificate |
| `subjectId` | string | No | What is being certified |
| `issuedAt` | string | Yes | ISO-8601 timestamp |
| `expiresAt` | string | No | ISO-8601 expiration |
| `standard` | string | No | Which standard it certifies against |
| `contentHash` | string | No | Hash of certified content |
| `evidence` | AssetReference[] | No | Supporting evidence |

### Provenance

Immutable record of origin, chain of custody, or transformation history.

- **Ledger mapping:** NFT (unique provenance record per source/batch)
- **Lifecycle:** RECORDED → VERIFIED → SUPERSEDED
- **Use cases:** Parts origin, supply chain steps, cold-chain custody

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourceId` | string | No | Origin identifier |
| `sourceType` | string | No | Category (mine, farm, lab, etc.) |
| `composition` | object | No | Material/data composition details |
| `location` | object | No | Geographic origin |
| `timestamp` | string | Yes | ISO-8601 timestamp |
| `parentRecords` | AssetReference[] | No | Upstream provenance links |
| `transformations` | object[] | No | Processing steps applied |

### Credit

Fungible, divisible unit of value representing a measurable quantity.

- **Ledger mapping:** FungibleToken (HTS)
- **Lifecycle:** MINTED → CIRCULATING → REDEEMED | BURNED
- **Use cases:** Renewable energy credits, carbon offsets, loyalty points

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `unit` | string | No | What one unit represents (MWh, tCO2, etc.) |
| `decimals` | number | No | Divisibility (0 for whole units, 2 for currency) |
| `backingEvidence` | AssetReference[] | No | What underlies the value |
| `issuancePolicy` | string | No | Guardian policy governing issuance |

### Agreement

Multi-party commitment with defined terms, parties, and conditions.

- **Ledger mapping:** NFT (unique agreement per set of parties)
- **Lifecycle:** DRAFT → PENDING_SIGNATURES → ACTIVE → EXPIRED | TERMINATED | REVOKED
- **Use cases:** Leases, NDAs, service agreements, procurement contracts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `parties` | PartyInfo[] | No | Signers and their roles |
| `termsHash` | string | Yes | Hash of agreement text |
| `effectiveDate` | string | No | ISO-8601 start date |
| `expirationDate` | string | No | ISO-8601 end date |
| `conditions` | AgreementCondition[] | No | Activation/termination conditions |
| `scope` | string | No | What the agreement covers |

### Inspection

Time-stamped observation or assessment by an authorized inspector.

- **Ledger mapping:** NFT (unique inspection record)
- **Lifecycle:** SUBMITTED → REVIEWED → ACCEPTED | DISPUTED
- **Use cases:** Soil tests, building audits, quality assessments

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inspectorId` | string | No | Who performed the inspection |
| `subjectId` | string | No | What was inspected |
| `inspectionType` | string | No | Category of inspection |
| `findings` | object | No | Structured results |
| `result` | string | No | `PASS`, `FAIL`, or `CONDITIONAL` |
| `conditions` | string[] | No | Conditions for CONDITIONAL result |
| `evidence` | AssetReference[] | No | Supporting evidence |
| `timestamp` | string | Yes | ISO-8601 timestamp |

### Milestone

Verifiable marker of progress within a larger process or project.

- **Ledger mapping:** NFT (unique milestone record)
- **Lifecycle:** PENDING → COMPLETED → VERIFIED
- **Use cases:** Rent payments, deliverables, construction phases

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | Which project/process |
| `milestoneIndex` | number | No | Sequence position |
| `description` | string | No | What was achieved |
| `evidence` | AssetReference[] | No | Proof of completion |
| `completedAt` | string | Yes | ISO-8601 timestamp |
| `dependencies` | AssetReference[] | No | Prerequisite milestones |

### Claim

Assertion that triggers a verification workflow. Bridge between off-chain reality and on-chain verification.

- **Ledger mapping:** NFT (persists regardless of outcome)
- **Lifecycle:** SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED | WITHDRAWN
- **Use cases:** Insurance claims, warranty claims, dispute resolution

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `claimantId` | string | Yes | Who is making the assertion |
| `claimType` | string | Yes | Category of claim |
| `assertion` | object | Yes | Structured claim description |
| `evidence` | AssetReference[] | No | Supporting evidence |
| `submittedAt` | string | Yes | ISO-8601 timestamp |
| `verificationPolicy` | string | No | Layer 2 policy governing verification |
| `resultingAssets` | AssetReference[] | No | Assets created if claim verified |

## Common Types

### AssetReference

Cross-reference to another on-chain asset:

```typescript
interface AssetReference {
  assetType: string;       // Asset type being referenced
  tokenId: string;         // Token/collection ID on ledger
  serialNumber?: number;   // Serial number (NFT) or null (fungible)
  label?: string;          // Human-readable label
}
```

### AssetType

```typescript
type AssetType = 'Certificate' | 'Provenance' | 'Credit' | 'Agreement'
               | 'Inspection' | 'Milestone' | 'Claim';
```

### LedgerMapping

```typescript
type LedgerMapping = 'NFT' | 'FungibleToken';
```

## Operation Factories (5)

Higher-order functions that accept configuration and return reusable async operations.

### createMintNFTAsset

Mint NFTs with structured metadata and optional audit trail.

```typescript
import { createMintNFTAsset } from '@trellis-mcp/asset-types';

const mintCert = createMintNFTAsset({
  assetType: 'Certificate',
  schemaType: 'CROP_YIELD_CERT',
  getCollectionId: (config) => config.cropCertCollectionId,
  buildMetadata: (args) => ({
    farmId: args.farmId,
    variety: args.variety,
    yieldKg: args.yieldKg,
  }),
  submitAudit: auditSubmitter,  // optional
});

const result = await mintCert(args, config);
// → { success, serialNumber, transactionId, tokenId, auditTimestamp, metadata }
```

### createMintTokenAsset

Mint fungible tokens (Credits) with optional audit trail.

```typescript
import { createMintTokenAsset } from '@trellis-mcp/asset-types';

const mintCredits = createMintTokenAsset({
  assetType: 'Credit',
  schemaType: 'REC_TOKEN',
  getTokenId: (config) => config.recTokenId,
  getAmount: (args) => args.megawattHours,
  submitAudit: auditSubmitter,  // optional
});

const result = await mintCredits(args, config);
// → { success, amount, transactionId, tokenId, auditTimestamp }
```

### createQueryAuditTrail

Query and filter audit trail messages from an HCS topic.

```typescript
import { createQueryAuditTrail } from '@trellis-mcp/asset-types';

const queryAudit = createQueryAuditTrail({
  getTopicId: (config) => config.auditTopicId,
});

const trail = await queryAudit({ schemaType: 'CROP_YIELD_CERT', limit: 50 }, config);
// → { topicId, messages: [{ consensusTimestamp, message, sequenceNumber }], count }
```

### createQueryRecord

Retrieve a single NFT record by schema type and serial number.

```typescript
import { createQueryRecord } from '@trellis-mcp/asset-types';

const queryRecord = createQueryRecord({
  supportedSchemas: ['CROP_YIELD_CERT', 'SOIL_INSPECTION'],
  getCollectionId: (config, schemaType) =>
    schemaType === 'CROP_YIELD_CERT' ? config.certCollectionId : config.inspCollectionId,
});

const record = await queryRecord('CROP_YIELD_CERT', 1, config);
// → { schemaType, collectionId, serialNumber, metadata, createdTimestamp }
```

### createAgreementLifecycle

Create grant (mint + transfer) and revoke (burn) functions for NFT-gated access control.

```typescript
import { createAgreementLifecycle } from '@trellis-mcp/asset-types';

const { grant, revoke } = createAgreementLifecycle({
  getCollectionId: (config) => config.leaseCollectionId,
  submitAudit: auditSubmitter,  // optional
});

const lease = await grant(config, tenantAccountId, { unit: 'A-101', termMonths: 12 });
// → { success, serialNumber, mintTransactionId, transferTransactionId, auditTimestamp }

const revoked = await revoke(config, lease.serialNumber, 'Lease terminated');
// → { success, serialNumber, burnTransactionId, auditTimestamp }
```

## Result Types

### AssetOperationResult

Returned by `createMintNFTAsset` and `createMintTokenAsset`:

```typescript
interface AssetOperationResult {
  success: boolean;
  schemaType: string;                    // Domain schema type
  assetType: AssetType;                  // Layer 3 asset type
  serialNumber?: number;                 // For NFTs
  amount?: number;                       // For tokens
  transactionId?: string;               // Ledger transaction ID
  tokenId: string;                       // Collection/token ID
  auditTimestamp?: string | null;        // Audit trail timestamp
  metadata?: Record<string, unknown>;    // Full metadata
}
```

### AuditTrailResult

Returned by `createQueryAuditTrail`:

```typescript
interface AuditTrailResult {
  topicId: string;
  messages: AuditTrailMessage[];
  count: number;
}
```

## How Layers 4 and 5 Use This Package

**Layer 4** (Domain Rules) composes schema primitives with domain-specific fields:

```typescript
// examples/domains/agriculture/schemas.ts
import type { CertificateSchema } from '@trellis-mcp/asset-types';

interface CropYieldCert extends CertificateSchema {
  farmId: string;
  variety: CropVariety;     // Layer 4 enum
  yieldKg: number;
  harvestDate: string;
}
```

**Layer 5** (Application Tools) uses operation factories to build domain tools:

```typescript
// examples/apps/crop-cert/tools.ts
import { createMintNFTAsset, createQueryAuditTrail } from '@trellis-mcp/asset-types';

const mintCropCert = createMintNFTAsset({ /* config */ });
const queryAudit = createQueryAuditTrail({ /* config */ });
```

## License

Apache License 2.0
