import type { HederaConfig } from '@tressellate/core/config';

/**
 * Energy domain configuration.
 * Extends HederaConfig with renewable energy credit resource IDs.
 */
export interface EnergyConfig extends HederaConfig {
    /** Fungible token ID for Renewable Energy Credits. */
    recTokenId?: string;
    /** NFT collection ID for generation certificates. */
    recCertCollectionId?: string;
    /** HCS topic ID for energy audit trail. */
    recAuditTopicId?: string;
}
