import type { HederaConfig } from '@tressellate/core/config';

/**
 * Agriculture domain configuration.
 * Extends HederaConfig with crop certification resource IDs.
 */
export interface AgricultureConfig extends HederaConfig {
    /** NFT collection ID for crop yield certificates. */
    cropCertCollectionId?: string;
    /** HCS topic ID for agriculture audit trail. */
    cropCertAuditTopicId?: string;
}
