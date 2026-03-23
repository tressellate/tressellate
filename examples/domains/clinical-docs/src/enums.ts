/**
 * Clinical documentation domain enums.
 * Models the vocabulary of ambient clinical scribes and EHR documentation.
 */

/** Clinical note format types. */
export const NoteFormat = [
    'SOAP',
    'HISTORY_PHYSICAL',
    'PROGRESS',
    'DISCHARGE',
    'PROCEDURE',
    'CONSULTATION',
    'REFERRAL',
] as const;
export type NoteFormat = (typeof NoteFormat)[number];

/** Medical specialty context for documentation. */
export const Specialty = [
    'GENERAL',
    'CARDIOLOGY',
    'ONCOLOGY',
    'PSYCHIATRY',
    'PAEDIATRICS',
    'SURGERY',
    'DERMATOLOGY',
    'NEUROLOGY',
    'ORTHOPAEDICS',
    'EMERGENCY',
] as const;
export type Specialty = (typeof Specialty)[number];

/** Encounter type classification. */
export const EncounterType = [
    'IN_PERSON',
    'TELEHEALTH',
    'HOME_VISIT',
    'EMERGENCY',
    'FOLLOW_UP',
] as const;
export type EncounterType = (typeof EncounterType)[number];

/** Patient consent scope. */
export const ConsentScope = [
    'RECORDING',
    'DATA_SHARING',
    'TREATMENT',
    'RESEARCH',
    'BILLING',
] as const;
export type ConsentScope = (typeof ConsentScope)[number];

/** Billing claim status in the verification workflow. */
export const ClaimStatus = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'DENIED',
    'APPEALED',
] as const;
export type ClaimStatus = (typeof ClaimStatus)[number];

/** LNC resilience status for off-chain clinical content. */
export const LNCStatus = [
    'NOT_ENCODED',
    'ENCODING',
    'ENCODED',
    'DEGRADED',
    'RECONSTRUCTING',
] as const;
export type LNCStatus = (typeof LNCStatus)[number];

/** DCL validation outcome for AI-generated clinical content. */
export const DCLValidationResult = [
    'VALID',
    'CONSTRAINED',
    'REJECTED',
    'OVERRIDDEN_BY_CLINICIAN',
] as const;
export type DCLValidationResult = (typeof DCLValidationResult)[number];

/** DCL clinical constraint categories. */
export const ClinicalConstraint = [
    'VITAL_SIGNS_RANGE',
    'DRUG_INTERACTION',
    'CONTRAINDICATION',
    'DOSAGE_LIMIT',
    'DIAGNOSIS_CONSISTENCY',
    'PROCEDURE_ELIGIBILITY',
    'ALLERGY_CONFLICT',
    'LAB_VALUE_PLAUSIBILITY',
] as const;
export type ClinicalConstraint = (typeof ClinicalConstraint)[number];

/** Schema type identifiers for Clinical Documentation NFTs. */
export const ClinicalSchemaType = [
    'CLINICAL_NOTE',
    'PATIENT_CONSENT',
    'CLINICAL_ASSESSMENT',
    'BILLING_CLAIM',
    'NOTE_PROVENANCE',
    'TREATMENT_MILESTONE',
    'LNC_RESILIENCE_RECORD',
    'DCL_VALIDATION_RECORD',
] as const;
export type ClinicalSchemaType = (typeof ClinicalSchemaType)[number];
