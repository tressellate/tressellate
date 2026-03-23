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

/** Schema type identifiers for Clinical Documentation NFTs. */
export const ClinicalSchemaType = [
    'CLINICAL_NOTE',
    'PATIENT_CONSENT',
    'CLINICAL_ASSESSMENT',
    'BILLING_CLAIM',
    'NOTE_PROVENANCE',
    'TREATMENT_MILESTONE',
] as const;
export type ClinicalSchemaType = (typeof ClinicalSchemaType)[number];
