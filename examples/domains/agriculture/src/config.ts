import type { HederaConfig } from '@trellis-mcp/core/config';

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
