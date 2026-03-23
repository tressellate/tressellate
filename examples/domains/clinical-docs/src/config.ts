import type { HederaConfig } from '@tressellate/core/config';

/**
 * Clinical documentation domain configuration.
 * Extends HederaConfig with clinical scribe resource IDs.
 */
export interface ClinicalDocsConfig extends HederaConfig {
    /** NFT collection ID for clinical note attestations. */
    clinicalNoteCollectionId?: string;
    /** NFT collection ID for patient consent records. */
    patientConsentCollectionId?: string;
    /** NFT collection ID for billing claims. */
    billingClaimCollectionId?: string;
    /** HCS topic ID for clinical documentation audit trail. */
    clinicalAuditTopicId?: string;
}
