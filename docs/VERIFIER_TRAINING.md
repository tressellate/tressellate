# Tressellate Verifier Training Guide

A no-code, hands-on exercise for non-developers to understand how AI agents interact with blockchain (Hiero/Hedera) through the tressellate MCP framework.

**Audience**: Verifiers, auditors, domain experts — no coding required.
**Duration**: ~2 hours for all 5 domains, or ~25 minutes per domain.
**What you'll use**: Claude Desktop (or any MCP-compatible AI chat) as your only interface.

---

## Table of Contents

1. [Concepts (5 min)](#part-0-concepts)
2. [Setup (15 min)](#part-1-setup)
3. [Exercise 1: Agriculture — Crop Certificates](#exercise-1-agriculture--crop-certificates)
4. [Exercise 2: Real Estate — Lease Agreements](#exercise-2-real-estate--lease-agreements)
5. [Exercise 3: Supply Chain — Parts Provenance](#exercise-3-supply-chain--parts-provenance)
6. [Exercise 4: Energy — Renewable Energy Credits](#exercise-4-energy--renewable-energy-credits)
7. [Exercise 5: Healthcare — Drug Lot Certification](#exercise-5-healthcare--drug-lot-certification)
8. [Exercise 6: Core Hedera Tools (Standalone)](#exercise-6-core-hedera-tools-standalone)
9. [Verification Checklist](#verification-checklist)

---

## Part 0: Concepts

### What is MCP?

MCP (Model Context Protocol) lets an AI assistant call structured tools. Instead of the AI guessing or hallucinating, it executes real operations — creating tokens, minting NFTs, querying balances — on a real blockchain.

### What is tressellate?

Tressellate is a set of **48 tools** organized in layers:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Domain Servers (what you interact with)       │
│  26 tools across 5 domains                              │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Domain Rules (enums, schemas, config)         │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Asset Types (7 universal schema primitives)   │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Guardian Tools (governance/identity)          │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Hashgraph Tools (22 raw Hedera operations)    │
└─────────────────────────────────────────────────────────┘
```

### The 7 Schema Primitives

Every asset in tressellate maps to one of these universal types:

| Primitive | What it represents | Think of it as... |
|-----------|-------------------|-------------------|
| **Certificate** | A verified attestation | A diploma or license |
| **Provenance** | Origin + custody chain | A shipping receipt trail |
| **Credit** | A unit of value | A voucher or token |
| **Agreement** | A multi-party contract | A signed lease |
| **Inspection** | An evaluation result | A test report |
| **Milestone** | A progress marker | A payment receipt |
| **Claim** | An assertion to verify | An insurance claim |

### How You'll Work

You type natural language into Claude Desktop. Claude reads the available tools, decides which to call, fills in the parameters, and returns results. You never write code.

```
You:     "Create a crop certificate for 500kg of organic rice from Farm F-12"
Claude:  Calls crop_cert_issue → returns serial #3, transaction ID 0.0.xxx@123
You:     "Verify that certificate"
Claude:  Calls crop_cert_verify with serial #3 → returns full metadata
```

---

## Part 1: Setup

### Step 1: Get a Hedera Testnet Account (free, 5 minutes)

1. Go to **https://portal.hedera.com** and create a free account
2. Navigate to the **Testnet** section
3. Copy your:
   - **Account ID** (looks like `0.0.12345`)
   - **DER-encoded private key** (starts with `302e...`)
4. These are free testnet credentials — no real money involved

### Step 2: Build tressellate (requires someone with terminal access)

Have a developer or admin run these one-time setup commands:

```bash
cd /path/to/tressellate
bun install
bun run build
```

### Step 3: Configure Claude Desktop

Have your admin add the domain server to Claude Desktop's config file.

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)

Pick the domain you want to test first. Here's the crop-cert example:

```json
{
  "mcpServers": {
    "crop-cert": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/crop-cert",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.YOUR_ID",
        "HEDERA_OPERATOR_KEY": "YOUR_PRIVATE_KEY",
        "HEDERA_SUPPLY_KEY": "YOUR_SUPPLY_KEY"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Step 4: Verify Connection

Open Claude Desktop and type:

> "What tools do you have available?"

Claude should list both `hedera_*` tools (Layer 1) and domain tools like `crop_cert_*`. If you see them, you're ready.

---

## Exercise 1: Agriculture — Crop Certificates

**Primitives used**: Certificate + Inspection
**Tools**: 5 domain tools + 22 core tools

### What you're simulating

A farm certifies crop yields as NFTs. Each certificate is immutable on the blockchain — once issued, it can't be altered. Auditors can verify any certificate by its serial number.

### Step 1: Create the NFT Collection (one-time setup)

> **Say to Claude**: "Create a crop certificate NFT collection"

**What happens behind the scenes**:
- Tool called: `crop_cert_create_collection`
- Hedera creates an NFT token class on testnet
- Returns a **Token ID** (e.g., `0.0.5678`)

**Write down the Token ID** — you'll need it. Have your admin set it as `HEDERA_CROP_CERT_COLLECTION_ID` in the config.

### Step 2: Create an Audit Trail Topic (one-time setup)

> **Say to Claude**: "Create a topic for crop certification audit trail"

**What happens**:
- Tool called: `hedera_create_topic`
- Returns a **Topic ID** (e.g., `0.0.5679`)

**Write down the Topic ID** — set it as `HEDERA_CROP_CERT_AUDIT_TOPIC_ID` in config, then restart Claude Desktop.

### Step 3: Issue a Crop Certificate

> **Say to Claude**: "Issue a crop yield certificate for Farm F-201, Field A3. The crop is 2,500 kg of Jasmine Rice, harvested on 2025-10-15, certified under USDA Organic standards."

**What happens**:
- Tool called: `crop_cert_issue`
- An NFT is minted with metadata: farm, field, crop, weight, date, standard
- An audit entry is submitted to the HCS topic
- Returns: **serial number** (e.g., `1`) and **transaction ID**

### Step 4: Issue a Second Certificate (different data)

> **Say to Claude**: "Issue another certificate: Farm F-305, Field B1, 800 kg of Cherry Tomatoes, harvested 2025-11-01, GAP certified."

**Observe**: The serial number increments (e.g., `2`).

### Step 5: Verify a Certificate

> **Say to Claude**: "Verify crop certificate serial number 1"

**What happens**:
- Tool called: `crop_cert_verify`
- Queries the NFT metadata from the mirror node
- Returns the full certificate data: farm, crop, weight, date, standard

**Verification question**: Does the returned data match what you issued in Step 3?

### Step 6: List Certificates by Farm

> **Say to Claude**: "List all crop certificates for my account"

**What happens**:
- Tool called: `crop_cert_list_by_farm`
- Queries all NFTs held by the operator account
- Returns a list of certificates with serial numbers

### Step 7: Query the Audit Trail

> **Say to Claude**: "Show me the crop certification audit trail"

**What happens**:
- Tool called: `crop_cert_get_audit`
- Reads all messages from the HCS topic
- Returns timestamped audit entries for every action taken

**Verification question**: Do you see entries for both certificates and the collection creation?

### Summary: What You Proved

| Capability | Tool Used | Verified? |
|-----------|-----------|-----------|
| Create NFT collection | `crop_cert_create_collection` | [ ] |
| Issue certificate with metadata | `crop_cert_issue` | [ ] |
| Verify certificate by serial # | `crop_cert_verify` | [ ] |
| List certificates by account | `crop_cert_list_by_farm` | [ ] |
| Immutable audit trail | `crop_cert_get_audit` | [ ] |

---

## Exercise 2: Real Estate — Lease Agreements

**Primitives used**: Agreement + Milestone
**Tools**: 5 domain tools + 22 core tools

### What you're simulating

A property manager mints lease agreements as NFTs and transfers them to tenants. Rent payments are recorded as milestones on the audit trail. Tenancy can be verified by checking who holds the NFT.

### Setup

> "Create a lease agreement NFT collection"
> "Create a topic for lease audit trail"

Save the Token ID and Topic ID to config, restart.

### Step 1: Create a Lease and Grant to Tenant

First, you need a tenant account:

> "Create a new Hedera account for a tenant"

**Write down the tenant Account ID** (e.g., `0.0.9001`).

Now grant the lease:

> "Grant a lease to tenant 0.0.9001 for Unit 4B at 123 Main St, starting 2025-01-01, ending 2026-01-01, monthly rent $2,500"

**What happens** (3-step operation):
1. NFT minted with lease metadata (unit, address, dates, rent amount)
2. NFT transferred from landlord (operator) to tenant
3. Audit entry submitted

### Step 2: Verify Tenancy

> "Verify that account 0.0.9001 holds a valid lease"

**What happens**:
- Tool called: `lease_verify_tenant`
- Checks if the tenant account holds a lease NFT
- Returns lease details if found

**Verification question**: Does the lease metadata match what you granted?

### Step 3: Record a Rent Payment

> "Record a rent payment of $2,500 from tenant 0.0.9001 for January 2025"

**What happens**:
- Tool called: `lease_record_payment`
- Submits a milestone message to the audit topic
- Returns confirmation

### Step 4: Query Audit Trail

> "Show the lease audit trail"

**Verification question**: Do you see entries for: lease creation, tenant transfer, and rent payment?

### Summary: What You Proved

| Capability | Tool Used | Verified? |
|-----------|-----------|-----------|
| Create lease collection | `lease_create_collection` | [ ] |
| Grant lease (mint + transfer) | `lease_grant` | [ ] |
| Verify tenant holds lease | `lease_verify_tenant` | [ ] |
| Record rent payment milestone | `lease_record_payment` | [ ] |
| Audit trail shows full history | `lease_get_audit` | [ ] |

---

## Exercise 3: Supply Chain — Parts Provenance

**Primitives used**: Provenance + Certificate
**Tools**: 5 domain tools + 22 core tools

### What you're simulating

A manufacturer tracks parts from origin through the supply chain. Each part gets an NFT with provenance data. Quality certifications are recorded on the audit trail.

### Setup

> "Create a parts provenance NFT collection"
> "Create a topic for parts provenance audit trail"

Save IDs, restart.

### Step 1: Record a Part's Provenance

> "Record provenance for Part P-4821: Titanium alloy bearing, manufactured by Precision Parts Co., batch B-2025-0042, origin: Osaka, Japan"

**What happens**:
- Tool called: `parts_prov_record`
- NFT minted with material, manufacturer, batch, origin metadata
- Returns serial number

### Step 2: Record a Second Part

> "Record provenance for Part P-4822: Carbon fiber panel, manufacturer AeroComposites Ltd., batch CF-2025-117, origin: Toulouse, France"

### Step 3: Verify a Part

> "Verify the provenance of part serial number 1"

**Verification question**: Does it show the titanium bearing from Osaka?

### Step 4: Certify Quality

> "Record a quality certification for part serial 1: ISO 9001 certified, inspector ID QA-207, passed all tests"

**What happens**:
- Tool called: `parts_prov_certify_quality`
- Submits certification to audit trail (not a new NFT — an audit entry)

### Step 5: Check Audit Trail

> "Show the parts provenance audit trail"

**Verification question**: Do you see provenance records and quality certification entries?

### Summary: What You Proved

| Capability | Tool Used | Verified? |
|-----------|-----------|-----------|
| Create provenance collection | `parts_prov_create_collection` | [ ] |
| Record part provenance | `parts_prov_record` | [ ] |
| Verify part by serial # | `parts_prov_verify` | [ ] |
| Certify quality (audit entry) | `parts_prov_certify_quality` | [ ] |
| Full provenance audit trail | `parts_prov_get_audit` | [ ] |

---

## Exercise 4: Energy — Renewable Energy Credits

**Primitives used**: Credit (fungible token) + Certificate (NFT)
**Tools**: 6 domain tools + 22 core tools

### What makes this exercise unique

This is the **only domain that uses both fungible tokens AND NFTs**:
- **REC tokens** (fungible): 1 token = 1 MWh of renewable energy
- **Generation certificates** (NFT): Proves where/how the energy was generated

### Setup

> "Create a Renewable Energy Credit token"

This creates a **fungible token** (not an NFT collection). Save the Token ID.

> "Create a generation certificate NFT collection"
> "Create a topic for energy audit trail"

Save all IDs, restart.

### Step 1: Mint Energy Credits

> "Mint 500 renewable energy credits representing 500 MWh generated at Solar Farm SF-101"

**What happens**:
- Tool called: `rec_mint_credits`
- 500 fungible tokens minted to the treasury
- Audit entry recorded

### Step 2: Issue a Generation Certificate

> "Issue a generation certificate for Solar Farm SF-101: 500 MWh of solar energy, generated in Q3 2025, verified by Green-e"

**What happens**:
- Tool called: `rec_issue_generation_cert`
- NFT minted with facility, source, period, verifier metadata
- Audit entry recorded

### Step 3: Check Balance

> "What is the REC token balance for my account?"

**What happens**:
- Tool called: `rec_get_balance`
- Returns: 500 tokens

### Step 4: Mint More Credits (Different Source)

> "Mint 200 RECs from Wind Farm WF-302"

Balance should now be 700. Verify:

> "Check my REC balance again"

### Step 5: Review Audit Trail

> "Show the energy audit trail"

**Verification question**: Do you see separate entries for each minting event and the generation certificate?

### Summary: What You Proved

| Capability | Tool Used | Verified? |
|-----------|-----------|-----------|
| Create fungible REC token | `rec_create_token` | [ ] |
| Create cert NFT collection | `rec_create_cert_collection` | [ ] |
| Mint fungible credits | `rec_mint_credits` | [ ] |
| Issue generation cert NFT | `rec_issue_generation_cert` | [ ] |
| Query token balance | `rec_get_balance` | [ ] |
| Audit trail (both types) | `rec_get_audit` | [ ] |

---

## Exercise 5: Healthcare — Drug Lot Certification

**Primitives used**: Certificate + Provenance
**Tools**: 5 domain tools + 22 core tools

### What you're simulating

A pharmaceutical company certifies drug lots with GMP compliance, NDC codes, expiration dates, and storage conditions. Cold-chain custody transfers are tracked.

### Setup

> "Create a drug certification NFT collection"
> "Create a topic for drug certification audit trail"

Save IDs, restart.

### Step 1: Certify a Drug Lot

> "Certify drug lot LOT-2025-A1: NDC code 12345-678-90, Amoxicillin 500mg capsules, GMP compliant, manufactured 2025-06-01, expires 2027-06-01, storage: 15-25C"

**What happens**:
- Tool called: `drug_cert_certify_lot`
- NFT minted with GMP status, NDC, drug details, expiration, storage conditions
- Audit entry recorded

### Step 2: Certify a Second Lot (Near Expiration)

> "Certify lot LOT-2025-B3: NDC 98765-432-10, Insulin Glargine, GMP compliant, manufactured 2025-01-01, expires 2025-07-01, storage: 2-8C refrigerated"

### Step 3: Verify a Lot

> "Verify drug lot certificate serial number 1"

**What happens**:
- Tool called: `drug_cert_verify_lot`
- Returns: GMP status, NDC code, drug info, **expiration check**

**Verification question**: Does it show Amoxicillin with valid dates?

### Step 4: Verify the Near-Expiration Lot

> "Verify drug lot certificate serial number 2"

**Verification question**: Does the system flag the expiration date proximity?

### Step 5: Record a Cold-Chain Shipment

> "Record a shipment for lot serial 1: shipped from Warehouse W-101 to Distribution Center DC-50, carrier: ColdChain Logistics, temperature maintained at 20C"

**What happens**:
- Tool called: `drug_cert_record_shipment`
- Custody transfer logged to audit trail

### Step 6: Review Audit Trail

> "Show the drug certification audit trail"

**Verification question**: Do you see certification events AND shipment custody transfers?

### Summary: What You Proved

| Capability | Tool Used | Verified? |
|-----------|-----------|-----------|
| Create drug cert collection | `drug_cert_create_collection` | [ ] |
| Certify lot with GMP/NDC | `drug_cert_certify_lot` | [ ] |
| Verify lot + expiration | `drug_cert_verify_lot` | [ ] |
| Record custody transfer | `drug_cert_record_shipment` | [ ] |
| Full drug audit trail | `drug_cert_get_audit` | [ ] |

---

## Exercise 6: Core Hedera Tools (Standalone)

These 22 tools from Layer 1 are available in **every** domain server. You can exercise them independently.

### Account Operations

> "Create a new Hedera testnet account"

Returns: new Account ID + keys.

> "Get account info for 0.0.XXXXX" (use the new account)

Returns: balance, keys, auto-renew period.

### Token Operations (Fungible)

> "Create a new fungible token called 'Training Token' with symbol 'TRNG' and 2 decimal places"

Returns: Token ID.

> "Mint 1000 units of token 0.0.XXXXX"

> "Check the balance of token 0.0.XXXXX for my account"

> "Get full info about token 0.0.XXXXX" (shows name, symbol, total supply)

### NFT Operations

> "Create an NFT collection called 'Test NFTs' with symbol 'TNFT'"

> "Mint an NFT in collection 0.0.XXXXX with metadata: {\"test\": \"hello world\"}"

> "Get info about NFT serial 1 in collection 0.0.XXXXX"

> "List all NFTs held by my account"

### Consensus Service (Audit Trail)

> "Create a new HCS topic"

> "Submit a message to topic 0.0.XXXXX: 'This is a test audit entry at 2025-10-15T10:00:00Z'"

> "Get all messages from topic 0.0.XXXXX"

### Transaction Queries

After any operation:

> "Get the receipt for transaction 0.0.XXXXX@1234567890.123" (use a real transaction ID from earlier)

### Core Tools Reference

| # | Tool | Category | What it does |
|---|------|----------|-------------|
| 1 | `hedera_create_account` | Account | Creates new account with ED25519 key |
| 2 | `hedera_get_account_info` | Account | Gets account details via mirror node |
| 3 | `hedera_create_token` | Token | Creates fungible token |
| 4 | `hedera_mint_token` | Token | Mints additional supply |
| 5 | `hedera_transfer_token` | Token | Transfers tokens between accounts |
| 6 | `hedera_burn_token` | Token | Burns tokens from treasury |
| 7 | `hedera_associate_token` | Token | Associates token with account |
| 8 | `hedera_create_nft_collection` | NFT | Creates NFT collection |
| 9 | `hedera_mint_nft` | NFT | Mints NFTs with metadata |
| 10 | `hedera_transfer_nft` | NFT | Transfers NFT by serial number |
| 11 | `hedera_burn_nft` | NFT | Burns NFTs |
| 12 | `hedera_get_nft_info` | NFT | Gets NFT metadata |
| 13 | `hedera_get_account_nfts` | NFT | Lists all NFTs for account |
| 14 | `contract_verify_holder` | NFT | Verifies NFT ownership |
| 15 | `hedera_create_topic` | Consensus | Creates HCS topic |
| 16 | `hedera_submit_topic_message` | Consensus | Submits message to topic |
| 17 | `hedera_get_topic_messages` | Consensus | Reads messages from topic |
| 18 | `hedera_get_token_balance` | Query | Gets token balance |
| 19 | `hedera_get_token_transaction_history` | Query | Gets transaction history |
| 20 | `hedera_get_token_info` | Query | Gets token statistics |
| 21 | `hedera_check_token_association` | Query | Checks token association |
| 22 | `hedera_get_transaction_receipt` | Query | Gets transaction receipt |

---

## Verification Checklist

Use this as a sign-off sheet after completing all exercises.

### Per-Domain Verification

| Domain | Collection Created | Asset Issued | Asset Verified | Audit Trail Correct | Signed Off |
|--------|-------------------|-------------|----------------|---------------------|------------|
| Agriculture (Crop Cert) | [ ] | [ ] | [ ] | [ ] | _______ |
| Real Estate (Lease) | [ ] | [ ] | [ ] | [ ] | _______ |
| Supply Chain (Parts) | [ ] | [ ] | [ ] | [ ] | _______ |
| Energy (REC) | [ ] | [ ] | [ ] | [ ] | _______ |
| Healthcare (Drug Cert) | [ ] | [ ] | [ ] | [ ] | _______ |

### Cross-Cutting Verification

| Property | How to verify | Passed? |
|----------|--------------|---------|
| **Immutability** | Try modifying a minted certificate — it should be impossible | [ ] |
| **Traceability** | Every write operation appears in the audit trail | [ ] |
| **Transparency** | Any serial number can be verified by anyone with access | [ ] |
| **Uniqueness** | Each NFT serial number is globally unique | [ ] |
| **Timestamping** | Audit entries have Hedera consensus timestamps | [ ] |
| **Separation of concerns** | Domain tools compose core tools, not bypass them | [ ] |

### What to Look For (Red Flags)

- Audit trail missing entries for operations you performed
- Metadata mismatch between issue and verify
- Duplicate serial numbers
- Operations succeeding without required fields
- Timestamps that don't reflect actual time of operation

---

## Appendix: Quick Setup for Each Domain Server

Each domain requires its own entry in Claude Desktop config. Here are all 5:

```json
{
  "mcpServers": {
    "crop-cert": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/crop-cert",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.XXXXX",
        "HEDERA_OPERATOR_KEY": "302e...",
        "HEDERA_SUPPLY_KEY": "302e..."
      }
    },
    "lease": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/lease",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.XXXXX",
        "HEDERA_OPERATOR_KEY": "302e...",
        "HEDERA_SUPPLY_KEY": "302e..."
      }
    },
    "parts-prov": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/parts-prov",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.XXXXX",
        "HEDERA_OPERATOR_KEY": "302e...",
        "HEDERA_SUPPLY_KEY": "302e..."
      }
    },
    "rec": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/rec",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.XXXXX",
        "HEDERA_OPERATOR_KEY": "302e...",
        "HEDERA_SUPPLY_KEY": "302e..."
      }
    },
    "drug-cert": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/drug-cert",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.XXXXX",
        "HEDERA_OPERATOR_KEY": "302e...",
        "HEDERA_SUPPLY_KEY": "302e..."
      }
    }
  }
}
```

**Tip**: You can run all 5 servers simultaneously. Claude will see all tools and route to the correct one based on your natural language request.

---

## Appendix: Hedera Explorer

After any exercise, you can independently verify transactions on the public explorer:

- **Testnet**: https://hashscan.io/testnet
- Search by: Account ID, Token ID, Topic ID, or Transaction ID
- This proves the data isn't just local — it's on the real Hedera testnet

---

Built for the tressellate framework — https://tressellate.dev
