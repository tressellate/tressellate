/**
 * Clinical documentation domain schemas.
 * Compose Layer 3 asset type patterns with clinical-specific fields.
 *
 * These schemas model what HealthOrbit/Ambient Scribe does — but backed
 * by immutable ledger records for trust, auditability, and verifiability.
 */

import type { NoteFormat, Specialty, EncounterType, ConsentScope, ClaimStatus } from './enums.js';

/**
 * Clinical note attestation metadata (composes Certificate).
 * Represents an AI-generated or clinician-authored clinical note
 * that has been attested and committed to the ledger.
 */
export interface ClinicalNoteSchema {
    type: 'CLINICAL_NOTE';
    /** Unique encounter/visit identifier. */
    encounterId: string;
    /** Patient identifier (anonymized/hashed for on-chain storage). */
    patientHash: string;
    /** Clinician who attested the note. */
    clinicianId: string;
    /** Documentation format. */
    noteFormat: NoteFormat;
    /** Medical specialty context. */
    specialty: Specialty;
    /** Type of clinical encounter. */
    encounterType: EncounterType;
    /** Hash of the full note content (stored off-chain in EHR/IPFS). */
    contentHash: string;
    /** ICD-10 diagnosis codes extracted from the encounter. */
    icdCodes: string[];
    /** CPT procedure codes extracted from the encounter. */
    cptCodes: string[];
    /** Language of the encounter. */
    language: string;
    /** Whether the note was AI-generated (ambient scribe). */
    aiGenerated: boolean;
    /** Whether the clinician reviewed and attested the AI-generated note. */
    clinicianAttested: boolean;
    /** When the encounter occurred (ISO-8601). */
    encounterDate: string;
    /** When the note was attested (ISO-8601). */
    attestedAt: string;
}

/**
 * Patient consent record metadata (composes Agreement).
 * Immutable record of patient consent for recording, data sharing, etc.
 */
export interface PatientConsentSchema {
    type: 'PATIENT_CONSENT';
    /** Patient identifier (hashed). */
    patientHash: string;
    /** Clinician or facility requesting consent. */
    requesterId: string;
    /** What the consent covers. */
    consentScopes: ConsentScope[];
    /** Hash of the full consent document. */
    termsHash: string;
    /** How consent was obtained. */
    consentMethod: 'VERBAL' | 'WRITTEN' | 'ELECTRONIC';
    /** When consent was granted (ISO-8601). */
    grantedAt: string;
    /** When consent expires, if applicable (ISO-8601). */
    expiresAt?: string;
    /** Whether consent can be revoked. */
    revocable: boolean;
}

/**
 * Clinical assessment/inspection metadata (composes Inspection).
 * Structured clinical observations from an encounter.
 */
export interface ClinicalAssessmentSchema {
    type: 'CLINICAL_ASSESSMENT';
    /** Reference to the encounter. */
    encounterId: string;
    /** Patient identifier (hashed). */
    patientHash: string;
    /** Assessing clinician. */
    clinicianId: string;
    /** Assessment category (e.g. 'VITALS', 'REVIEW_OF_SYSTEMS', 'PHYSICAL_EXAM'). */
    assessmentType: string;
    /** Structured findings from the assessment. */
    findings: Record<string, unknown>;
    /** Overall clinical impression. */
    result: 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'INCONCLUSIVE';
    /** Follow-up actions recommended. */
    followUpActions?: string[];
    /** When the assessment was performed (ISO-8601). */
    assessedAt: string;
}

/**
 * Billing claim metadata (composes Claim).
 * Transparent, verifiable billing claim lifecycle on-ledger.
 */
export interface BillingClaimSchema {
    type: 'BILLING_CLAIM';
    /** Reference to the clinical note that generated this claim. */
    noteRef: string;
    /** Patient identifier (hashed). */
    patientHash: string;
    /** Rendering provider. */
    clinicianId: string;
    /** CPT codes for billing. */
    cptCodes: string[];
    /** ICD-10 codes supporting medical necessity. */
    icdCodes: string[];
    /** Payer/insurance identifier. */
    payerId: string;
    /** Claim amount in cents. */
    amountCents: number;
    /** Current claim status. */
    status: ClaimStatus;
    /** When the claim was submitted (ISO-8601). */
    submittedAt: string;
}

/**
 * Note provenance metadata (composes Provenance).
 * Tracks the full chain of who created, edited, and signed a clinical note.
 */
export interface NoteProvenanceSchema {
    type: 'NOTE_PROVENANCE';
    /** Reference to the clinical note. */
    noteRef: string;
    /** Action performed. */
    action: 'CREATED' | 'EDITED' | 'REVIEWED' | 'ATTESTED' | 'AMENDED' | 'ADDENDUM';
    /** Who performed the action. */
    actorId: string;
    /** Actor role (e.g. 'AI_SCRIBE', 'PHYSICIAN', 'NURSE', 'CODER'). */
    actorRole: string;
    /** Hash of the note content at this point in time. */
    contentHash: string;
    /** What changed (for edits/amendments). */
    changeSummary?: string;
    /** When the action occurred (ISO-8601). */
    timestamp: string;
}

/**
 * Treatment milestone metadata (composes Milestone).
 * Tracks care plan progress and treatment milestones.
 */
export interface TreatmentMilestoneSchema {
    type: 'TREATMENT_MILESTONE';
    /** Care plan or treatment identifier. */
    carePlanId: string;
    /** Patient identifier (hashed). */
    patientHash: string;
    /** Milestone sequence within the care plan. */
    milestoneIndex: number;
    /** Description of the milestone. */
    description: string;
    /** Clinician who verified completion. */
    verifiedBy: string;
    /** Clinical outcome or measurement. */
    outcome?: string;
    /** When the milestone was completed (ISO-8601). */
    completedAt: string;
}
