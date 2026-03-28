# Tressellate — Verifier Quick Reference Card

> **48 MCP tools** | **5 domains** | **7 schema primitives** | All via natural language in Claude Desktop

---

## The 7 Universal Primitives

| Primitive | Icon | Represents | Hedera Type |
|-----------|------|-----------|-------------|
| Certificate | :page_facing_up: | Verified attestation | NFT |
| Provenance | :link: | Origin + custody chain | NFT |
| Credit | :coin: | Unit of value | Fungible Token |
| Agreement | :handshake: | Multi-party contract | NFT + Transfer |
| Inspection | :mag: | Evaluation result | NFT |
| Milestone | :checkered_flag: | Progress marker | HCS Message |
| Claim | :raised_hand: | Assertion to verify | NFT |

---

## Domain Tools at a Glance

### Agriculture — Crop Certificates (5 tools)

| Tool | Say to Claude |
|------|--------------|
| `crop_cert_create_collection` | "Create a crop certificate NFT collection" |
| `crop_cert_issue` | "Issue a crop certificate for 2500kg of organic rice from Farm F-201" |
| `crop_cert_verify` | "Verify crop certificate serial number 1" |
| `crop_cert_list_by_farm` | "List all crop certificates for my account" |
| `crop_cert_get_audit` | "Show the crop certification audit trail" |

### Real Estate — Lease Agreements (5 tools)

| Tool | Say to Claude |
|------|--------------|
| `lease_create_collection` | "Create a lease agreement NFT collection" |
| `lease_grant` | "Grant a lease to tenant 0.0.9001 for Unit 4B, $2500/month" |
| `lease_verify_tenant` | "Verify that account 0.0.9001 holds a valid lease" |
| `lease_record_payment` | "Record a rent payment of $2500 from tenant 0.0.9001" |
| `lease_get_audit` | "Show the lease audit trail" |

### Supply Chain — Parts Provenance (5 tools)

| Tool | Say to Claude |
|------|--------------|
| `parts_prov_create_collection` | "Create a parts provenance NFT collection" |
| `parts_prov_record` | "Record provenance for Part P-4821: titanium bearing from Osaka" |
| `parts_prov_verify` | "Verify the provenance of part serial number 1" |
| `parts_prov_certify_quality` | "Record ISO 9001 quality certification for part serial 1" |
| `parts_prov_get_audit` | "Show the parts provenance audit trail" |

### Energy — Renewable Energy Credits (6 tools)

| Tool | Say to Claude |
|------|--------------|
| `rec_create_token` | "Create a Renewable Energy Credit token" |
| `rec_create_cert_collection` | "Create a generation certificate NFT collection" |
| `rec_mint_credits` | "Mint 500 RECs from Solar Farm SF-101" |
| `rec_issue_generation_cert` | "Issue a generation certificate for 500 MWh solar, verified by Green-e" |
| `rec_get_balance` | "What is my REC token balance?" |
| `rec_get_audit` | "Show the energy audit trail" |

### Healthcare — Drug Lot Certification (5 tools)

| Tool | Say to Claude |
|------|--------------|
| `drug_cert_create_collection` | "Create a drug certification NFT collection" |
| `drug_cert_certify_lot` | "Certify lot LOT-2025-A1: Amoxicillin 500mg, GMP compliant, expires 2027-06-01" |
| `drug_cert_verify_lot` | "Verify drug lot certificate serial number 1" |
| `drug_cert_record_shipment` | "Record shipment for lot serial 1 from Warehouse W-101 to DC-50" |
| `drug_cert_get_audit` | "Show the drug certification audit trail" |

---

## Core Hedera Tools (22 — available in every domain)

### Create

| Tool | Say to Claude |
|------|--------------|
| `hedera_create_account` | "Create a new Hedera testnet account" |
| `hedera_create_token` | "Create a fungible token called Training Token, symbol TRNG" |
| `hedera_create_nft_collection` | "Create an NFT collection called Test NFTs" |
| `hedera_create_topic` | "Create a new HCS topic" |

### Write

| Tool | Say to Claude |
|------|--------------|
| `hedera_mint_token` | "Mint 1000 units of token 0.0.XXXXX" |
| `hedera_mint_nft` | "Mint an NFT with metadata: hello world" |
| `hedera_transfer_token` | "Transfer 100 tokens to account 0.0.XXXXX" |
| `hedera_transfer_nft` | "Transfer NFT serial 1 to account 0.0.XXXXX" |
| `hedera_burn_token` | "Burn 50 tokens from token 0.0.XXXXX" |
| `hedera_burn_nft` | "Burn NFT serial 2 from collection 0.0.XXXXX" |
| `hedera_associate_token` | "Associate token 0.0.XXXXX with account 0.0.YYYYY" |
| `hedera_submit_topic_message` | "Submit message 'test entry' to topic 0.0.XXXXX" |

### Read

| Tool | Say to Claude |
|------|--------------|
| `hedera_get_account_info` | "Get account info for 0.0.XXXXX" |
| `hedera_get_token_info` | "Get info about token 0.0.XXXXX" |
| `hedera_get_token_balance` | "Get balance of token 0.0.XXXXX for my account" |
| `hedera_get_nft_info` | "Get info about NFT serial 1 in collection 0.0.XXXXX" |
| `hedera_get_account_nfts` | "List all NFTs held by account 0.0.XXXXX" |
| `hedera_get_topic_messages` | "Get all messages from topic 0.0.XXXXX" |
| `hedera_get_token_transaction_history` | "Show transaction history for token 0.0.XXXXX" |
| `hedera_check_token_association` | "Is token 0.0.XXXXX associated with account 0.0.YYYYY?" |
| `hedera_get_transaction_receipt` | "Get receipt for transaction 0.0.XXXXX@1234567890" |
| `contract_verify_holder` | "Verify account 0.0.XXXXX holds an NFT from collection 0.0.YYYYY" |

---

## Standard Workflow (All Domains)

```
1. CREATE COLLECTION  ──→  Get Token ID         (one-time)
2. CREATE TOPIC       ──→  Get Topic ID         (one-time)
3. ISSUE / MINT       ──→  Get Serial # or Tx   (per asset)
4. VERIFY             ──→  Confirm metadata      (anytime)
5. AUDIT TRAIL        ──→  Review all actions    (anytime)
```

---

## Verify Independently

After any exercise, confirm on the public Hedera explorer:

| Network | URL |
|---------|-----|
| Testnet | https://hashscan.io/testnet |
| Mainnet | https://hashscan.io/mainnet |

Search by **Account ID**, **Token ID**, **Topic ID**, or **Transaction ID**.

---

## Setup Checklist

| Step | Done? |
|------|-------|
| Hedera testnet account created at portal.hedera.com | [ ] |
| Account ID and private key copied | [ ] |
| `bun install && bun run build` completed | [ ] |
| Claude Desktop config updated with server entry | [ ] |
| Claude Desktop restarted | [ ] |
| "What tools do you have?" returns tool list | [ ] |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Claude says "no tools available" | Restart Claude Desktop; check config JSON syntax |
| "Token not configured" error | Run the create collection step; add Token ID to env config |
| "Topic not configured" error | Run the create topic step; add Topic ID to env config |
| Transaction fails | Check testnet account has HBAR balance at portal.hedera.com |
| "Account not associated" | Run `hedera_associate_token` before transferring to new accounts |

---

*tressellate.dev — 48 tools, 5 layers, zero code required*
