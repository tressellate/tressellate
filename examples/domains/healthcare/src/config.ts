import type { HederaConfig } from '@trellis-mcp/core/config';

/**
 * Healthcare domain configuration.
 * Extends HederaConfig with drug lot certification resource IDs.
 */
export interface HealthcareConfig extends HederaConfig {
    /** NFT collection ID for drug lot certificates. */
    drugCertCollectionId?: string;
    /** HCS topic ID for healthcare audit trail. */
    drugCertAuditTopicId?: string;
}
