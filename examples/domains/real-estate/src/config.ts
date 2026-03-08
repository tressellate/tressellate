import type { HederaConfig } from '@trellis-mcp/core/config';

/**
 * Real Estate domain configuration.
 * Extends HederaConfig with lease management resource IDs.
 */
export interface RealEstateConfig extends HederaConfig {
    /** NFT collection ID for lease agreements. */
    leaseCollectionId?: string;
    /** HCS topic ID for lease audit trail. */
    leaseAuditTopicId?: string;
}
