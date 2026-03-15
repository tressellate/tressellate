import type { HederaConfig } from '@tressellate/core/config';
import { mintNFT } from '@tressellate/core';
import type { AssetOperationResult, AssetType } from '../types.js';

/**
 * Configuration for a mint-NFT-asset operation factory.
 *
 * This encapsulates the common pattern:
 *   validate config → build metadata → mintNFT → submitAudit → return result
 *
 * Used by: bcb_certify_batch, bcb_record_biochar, bcb_record_deployment,
 *          ics_certify_mix, nda_grant_access
 */
export interface MintNFTAssetOptions<TConfig extends HederaConfig, TArgs> {
    /** Layer 3 asset type this operation creates. */
    assetType: AssetType;
    /** Domain schema type name (e.g. 'TERRAPRIMACERT', 'BATCHCERT'). */
    schemaType: string;
    /** Extract the collection ID from config, or throw if missing. */
    getCollectionId: (config: TConfig) => string;
    /** Build the NFT metadata JSON from input args. */
    buildMetadata: (args: TArgs) => Record<string, unknown>;
    /** Optional: submit an audit trail message after minting. */
    submitAudit?: (
        config: TConfig,
        metadata: Record<string, unknown>,
        mintResult: { serialNumber: number; transactionId: string }
    ) => Promise<{ consensusTimestamp?: string | null }>;
}

/**
 * Creates a reusable mint-NFT-asset function.
 *
 * The returned function handles: get collection ID → build metadata →
 * mint NFT → submit audit → return standardized result.
 */
export function createMintNFTAsset<TConfig extends HederaConfig, TArgs>(
    options: MintNFTAssetOptions<TConfig, TArgs>
) {
    return async (args: TArgs, config: TConfig): Promise<AssetOperationResult> => {
        const collectionId = options.getCollectionId(config);
        const metadata = {
            type: options.schemaType,
            ...options.buildMetadata(args),
        };

        const mintResult = await mintNFT(
            config,
            collectionId,
            [JSON.stringify(metadata)]
        );

        let auditTimestamp: string | null = null;
        if (options.submitAudit) {
            const auditResult = await options.submitAudit(config, metadata, {
                serialNumber: mintResult.serialNumbers[0],
                transactionId: mintResult.transactionId,
            });
            auditTimestamp = auditResult.consensusTimestamp ?? null;
        }

        return {
            success: true,
            schemaType: options.schemaType,
            assetType: options.assetType,
            serialNumber: mintResult.serialNumbers[0],
            transactionId: mintResult.transactionId,
            tokenId: collectionId,
            auditTimestamp,
            metadata,
        };
    };
}
