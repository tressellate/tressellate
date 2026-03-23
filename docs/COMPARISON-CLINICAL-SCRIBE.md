# Clinical Scribe: Tressellate vs HealthOrbit AI — Side-by-Side Comparison

## Executive Summary

HealthOrbit AI is a cloud-based ambient scribe that listens to clinical encounters and generates notes. Tressellate's Clinical Scribe replicates the same documentation workflows but adds what HealthOrbit fundamentally cannot: **DLT-backed trust, immutable audit trails, physics-bounded AI validation (DCL), and resilient PHI storage (LNC)**.

---

## Architecture

| Dimension | HealthOrbit AI | Tressellate Clinical Scribe |
|-----------|---------------|---------------------------|
| **Architecture** | Monolithic SaaS platform | 5-layer composable architecture (Layers 1-5) |
| **Trust model** | Trust the vendor | Trust the ledger — independently verifiable |
| **Data storage** | Vendor cloud (mutable database) | On-chain attestation (immutable) + off-chain content |
| **AI interface** | Proprietary web/mobile app | Model Context Protocol (MCP) — any AI agent |
| **Extensibility** | Closed; vendor-controlled | Open-source core; compose new domains freely |
| **Ledger** | None | Hedera Hashgraph (Hiero) — 10,000+ TPS, 3-5s finality |
| **Protocol** | REST API (proprietary) | MCP 1.0+ (open standard) |

---

## Feature Comparison

### Core Clinical Documentation

| Feature | HealthOrbit AI | Tressellate Clinical Scribe |
|---------|---------------|---------------------------|
| **Ambient listening** | Yes — real-time recording | Via any MCP-compatible AI agent |
| **SOAP notes** | Yes | Yes — `SOAP` format in `clinical_attest_note` |
| **H&P notes** | Yes | Yes — `HISTORY_PHYSICAL` format |
| **Progress notes** | Yes | Yes — `PROGRESS` format |
| **Discharge notes** | Yes | Yes — `DISCHARGE` format |
| **Procedure notes** | Yes | Yes — `PROCEDURE` format |
| **Consultation notes** | Yes | Yes — `CONSULTATION` format |
| **Referral notes** | Yes | Yes — `REFERRAL` format |
| **Multi-lingual support** | Yes — multiple languages | Yes — ISO 639-1 language field per note |
| **ICD-10 code extraction** | Yes — automated | Yes — stored on-chain with attestation |
| **CPT code extraction** | Yes — automated | Yes — stored on-chain with attestation |
| **Specialty templates** | Yes — 10+ specialties | Yes — 10 specialties (GENERAL through EMERGENCY) |
| **Real-time editing** | Yes — in-app | Yes — amendment/addendum provenance tracking |
| **Note immutability** | No — mutable database records | **Yes — NFT attestation; content hash on-chain** |
| **Note provenance chain** | No | **Yes — full chain: AI_SCRIBE → PHYSICIAN → CODER** |

### Patient Consent

| Feature | HealthOrbit AI | Tressellate Clinical Scribe |
|---------|---------------|---------------------------|
| **Consent capture** | Verbal disclosure (recommended script) | **Immutable NFT on-ledger** via `clinical_record_consent` |
| **Consent verification** | Internal database flag | **On-chain verification** via `clinical_verify_consent` |
| **Consent scopes** | Recording only | **5 scopes: RECORDING, DATA_SHARING, TREATMENT, RESEARCH, BILLING** |
| **Consent methods** | Verbal only (recommended) | **VERBAL, WRITTEN, ELECTRONIC** |
| **Consent expiration** | Not tracked | **Automatic expiry checking with ISO-8601 dates** |
| **Consent revocation** | Manual process | **Revocable flag with on-chain status** |
| **Tamper-proof** | No — vendor database | **Yes — NFT; cannot be altered after minting** |
| **Third-party verifiable** | No — trust vendor | **Yes — any party can verify on Hedera** |

### Billing & Claims

| Feature | HealthOrbit AI | Tressellate Clinical Scribe |
|---------|---------------|---------------------------|
| **Automated coding** | Yes — ICD-10/CPT | Yes — codes extracted and stored on-chain |
| **Claim submission** | Yes — to clearinghouses | **Yes — on-chain claim lifecycle** via `clinical_submit_claim` |
| **Claim transparency** | Opaque — vendor pipeline | **Transparent — every claim traceable to source encounter** |
| **Claim lifecycle** | Internal workflow | **SUBMITTED → UNDER_REVIEW → APPROVED/DENIED/APPEALED** |
| **Claim-to-note linkage** | Internal reference | **On-chain reference — `noteRef` links claim to attestation NFT** |
| **Fraud detection** | Not documented | **Built-in — every claim has verifiable source encounter** |

### Clinical Assessment

| Feature | HealthOrbit AI | Tressellate Clinical Scribe |
|---------|---------------|---------------------------|
| **Vitals recording** | Via ambient listening | **Structured on-chain** via `clinical_record_assessment` |
| **Physical exam** | In note body | **Typed assessment with NORMAL/ABNORMAL/CRITICAL/INCONCLUSIVE** |
| **Follow-up actions** | In note body | **Structured array — independently queryable** |
| **Assessment types** | Unstructured | **VITALS, REVIEW_OF_SYSTEMS, PHYSICAL_EXAM, LAB_REVIEW** |

### Audit Trail

| Feature | HealthOrbit AI | Tressellate Clinical Scribe |
|---------|---------------|---------------------------|
| **Audit logging** | Internal logs (vendor-controlled) | **Hedera Consensus Service (HCS) — immutable public ledger** |
| **Audit access** | Vendor portal only | **Open query** via `clinical_get_audit` |
| **Audit scope** | Not documented | **Every action: attestations, consents, claims, assessments, LNC, DCL** |
| **Tamper-proof** | No — vendor can modify | **Yes — HCS consensus timestamps, immutable** |
| **Third-party audit** | Requires vendor cooperation | **Self-service — any authorized party queries HCS directly** |

---

## LNC (Linear Network Coding) — What HealthOrbit Cannot Do

LNC is a Layer 1 resilience upgrade exclusive to Tressellate. It solves the fundamental vulnerability of all cloud-based scribes: **data loss and vendor lock-in**.

| Dimension | HealthOrbit AI | Tressellate + LNC |
|-----------|---------------|-------------------|
| **Off-chain data resilience** | Single vendor cloud | **Polynomial-coded packets across network nodes** |
| **Single point of failure** | Yes — vendor cloud | **No — reconstructible from k-of-n nodes** |
| **PHI exposure per node** | Complete copy on vendor servers | **No single node holds complete PHI** |
| **Vendor lock-in** | Yes — data trapped in vendor cloud | **No — data mathematically reconstructible** |
| **EHR outage survival** | No — notes lost if vendor down | **Yes — reconstruct from any sufficient subset** |
| **Integrity verification** | Trust vendor | **On-chain proof without decrypting content** |
| **Storage cost** | Full replication (1x) | **O(k/n) per node — e.g., 60% at 6-of-10** |
| **Privacy model** | Encryption (key holder has full access) | **Encryption + fragmentation (no single keyholder sees all)** |

### LNC Tools

| Tool | Purpose |
|------|---------|
| `clinical_lnc_encode` | Encode clinical content into polynomial-coded packets with k-of-n threshold |
| `clinical_lnc_verify` | Verify resilience status, active nodes, and reconstruction capability |

---

## DCL (Domain Coupled Learning) — What HealthOrbit Cannot Do

DCL is a physics-bounded intelligence layer exclusive to Tressellate. It solves the fundamental problem of all AI scribes: **hallucinated clinical content**.

| Dimension | HealthOrbit AI | Tressellate + DCL |
|-----------|---------------|-------------------|
| **AI hallucination prevention** | Clinician review (manual) | **Coupling tensors validate against domain physics BEFORE commit** |
| **Vital signs validation** | None — trusts AI output | **Physiologically impossible values blocked (HR, BP, Temp, SpO2, RR)** |
| **Drug interaction check** | None at documentation layer | **Known interactions flagged before attestation** |
| **Dosage validation** | None | **Maximum dosage limits enforced** |
| **Diagnosis consistency** | None | **Procedures without supporting diagnoses flagged** |
| **Lab value plausibility** | None | **Values >10x outside reference range blocked as hallucinations** |
| **Clinician override** | N/A (no validation to override) | **Full on-chain accountability — reason documented** |
| **Validated Clinical State** | Does not exist | **Hashgraph record proving AI was physics-bounded** |
| **Pre-commit savings** | N/A | **Errors caught before on-chain commit — no wasted gas** |
| **Error rate** | 1-3% (industry average for LLM scribes) | **Reduced by constraint surface — hallucinations never reach ledger** |

### DCL Clinical Constraints

| Constraint | What It Catches |
|-----------|----------------|
| `VITAL_SIGNS_RANGE` | HR outside 20-300 bpm, SBP outside 40-300 mmHg, Temp outside 85-115°F, SpO2 outside 0-100%, RR outside 4-60 |
| `DRUG_INTERACTION` | Known interactions between concurrent medications |
| `CONTRAINDICATION` | Contraindicated procedures/medications (via lookup tables) |
| `DOSAGE_LIMIT` | Dosages exceeding pharmacokinetic maximums |
| `DIAGNOSIS_CONSISTENCY` | Procedures documented without supporting diagnoses |
| `PROCEDURE_ELIGIBILITY` | Procedures not eligible for documented conditions |
| `ALLERGY_CONFLICT` | Medications conflicting with documented allergies |
| `LAB_VALUE_PLAUSIBILITY` | Lab values implausibly far outside reference ranges |

### DCL Tools

| Tool | Purpose |
|------|---------|
| `clinical_dcl_validate` | Validate AI content against coupling tensors; returns VALID/CONSTRAINED/REJECTED |
| `clinical_dcl_override` | Record clinician override with documented justification on-chain |

---

## Security & Compliance

| Dimension | HealthOrbit AI | Tressellate Clinical Scribe |
|-----------|---------------|---------------------------|
| **HIPAA compliance** | Yes — certified | Yes — PHI hashed before on-chain storage |
| **GDPR compliance** | Yes — certified | Yes — patient data anonymized (patientHash) |
| **SOC 2 Type 2** | Not documented | N/A — trust is ledger-based, not vendor-based |
| **Data encryption** | AES at rest + TLS in transit | AES-256-GCM + LNC fragmentation (no complete copy anywhere) |
| **Consent lawsuits risk** | **High — CA/IL lawsuits alleging recording without consent** | **Low — immutable consent NFT proves consent was granted** |
| **Vendor data use** | PHI may be used for model training (transparency concerns) | **No vendor — data stays on Hiero ledger + LNC nodes** |
| **Attack surface** | Vendor cloud + EHR integration | Decentralized — no single point of compromise |
| **Wiretapping liability** | **Risk — passive recording may violate state statutes** | **Mitigated — on-chain consent proof before recording starts** |
| **Post-termination data** | Depends on vendor contract | **On-chain forever — no vendor deletion risk** |
| **Audit for regulators** | Requires vendor cooperation | **Self-service — regulators query HCS directly** |

---

## Cost Structure

| Dimension | HealthOrbit AI | Tressellate Clinical Scribe |
|-----------|---------------|---------------------------|
| **Pricing model** | Per-clinician/month SaaS (£33+/mo) | Hedera network fees (~$0.0001/transaction) |
| **Per-note cost** | Included in subscription | ~$0.001 (NFT mint + HCS message) |
| **Per-consent cost** | Included | ~$0.001 (NFT mint) |
| **Per-claim cost** | Included | ~$0.001 (NFT mint) |
| **LNC encoding** | N/A | ~$0.001 + node storage (60% of full replication) |
| **DCL validation** | N/A | ~$0.001 per validation (pre-commit — saves on rejected mints) |
| **Scaling cost** | Linear per clinician | **Sublinear — network fees don't scale with clinician count** |
| **100 clinicians/month** | ~£3,300+/mo | ~$50-100/mo in network fees |
| **Vendor lock-in cost** | Data migration fees | **Zero — data on public ledger** |

---

## Tool Inventory

### HealthOrbit AI
| Capability | Delivery |
|-----------|----------|
| Ambient listening | Proprietary app |
| Note generation | Proprietary AI |
| EHR integration | REST API |
| Billing prep | Internal pipeline |
| **Total capabilities** | **~4-5 (monolithic)** |

### Tressellate Clinical Scribe
| Group | Tools | Count |
|-------|-------|-------|
| Collection | `clinical_create_note_collection`, `clinical_create_consent_collection`, `clinical_create_claim_collection` | 3 |
| Notes | `clinical_attest_note`, `clinical_record_provenance` | 2 |
| Consent | `clinical_record_consent` | 1 |
| Billing | `clinical_submit_claim`, `clinical_record_assessment` | 2 |
| Query | `clinical_verify_note`, `clinical_verify_consent` | 2 |
| Audit | `clinical_get_audit` | 1 |
| LNC | `clinical_lnc_encode`, `clinical_lnc_verify` | 2 |
| DCL | `clinical_dcl_validate`, `clinical_dcl_override` | 2 |
| **Domain tools** | | **14** |
| Layer 1 (Hedera) | Token, NFT, Account, Consensus, Query tools | **22** |
| **Total MCP tools per server** | | **36** |

---

## Risk Comparison

| Risk | HealthOrbit AI | Tressellate Clinical Scribe |
|------|---------------|---------------------------|
| **AI hallucination reaches EHR** | High — clinician review is sole safeguard | **Low — DCL blocks implausible content pre-commit** |
| **Consent dispute** | **High — verbal consent, no proof** | Low — NFT consent record on-chain |
| **Data loss** | Medium — single vendor cloud | **Very low — LNC reconstruction from any k-of-n nodes** |
| **Vendor shutdown** | **Critical — all data trapped** | None — data on public ledger |
| **Billing fraud** | Medium — opaque pipeline | **Low — every claim traceable to source encounter on-chain** |
| **Regulatory non-compliance** | Medium — evolving HIPAA rules | **Low — immutable audit trail satisfies any auditor** |
| **Note tampering** | Medium — database is mutable | **None — NFT attestation is immutable** |
| **Privacy breach** | Medium — complete PHI on vendor servers | **Low — LNC ensures no single node has complete PHI** |

---

## Summary

| | HealthOrbit AI | Tressellate Clinical Scribe |
|---|---|---|
| **Best for** | Quick SaaS deployment, clinicians who want plug-and-play | Organizations requiring verifiable trust, auditability, and AI safety |
| **Trust model** | Vendor trust | Ledger trust |
| **AI safety** | Manual clinician review | **DCL physics-bounded validation** |
| **Data resilience** | Vendor backup | **LNC polynomial reconstruction** |
| **Cost at scale** | Expensive (per-clinician) | **Cheap (per-transaction)** |
| **Consent proof** | None | **Immutable on-chain** |
| **Audit readiness** | Vendor-dependent | **Self-service, regulator-friendly** |
| **Open standard** | No | **Yes — MCP 1.0+** |
