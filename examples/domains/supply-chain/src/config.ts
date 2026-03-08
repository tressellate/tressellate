import type { HederaConfig } from '@trellis-mcp/core/config';

/**
 * Supply Chain domain configuration.
 * Extends HederaConfig with parts provenance resource IDs.
 */
export interface SupplyChainConfig extends HederaConfig {
    /** NFT collection ID for parts provenance records. */
    partsCollectionId?: string;
    /** HCS topic ID for supply chain audit trail. */
    partsAuditTopicId?: string;
}
