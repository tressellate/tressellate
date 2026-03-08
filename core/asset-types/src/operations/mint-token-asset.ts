import type { HederaConfig } from '@trellis-mcp/core/config';
import { mintToken } from '@trellis-mcp/core';
import type { AssetOperationResult, AssetType } from '../types.js';

/**
 * Configuration for a mint-token-asset operation factory.
 *
 * This encapsulates the common pattern:
 *   validate config → mint fungible tokens → submitAudit → return result
 *
 * Used by: bcb_mint_soil_credit, ics_mint_carbon_credit
 */
export interface MintTokenAssetOptions<TConfig extends HederaConfig, TArgs> {
    /** Layer 3 asset type (always 'Credit' for fungible tokens). */
    assetType: AssetType;
    /** Domain schema type name (e.g. 'SOILCARBON', 'CARBON'). */
    schemaType: string;
    /** Extract the token ID from config, or throw if missing. */
    getTokenId: (config: TConfig) => string;
    /** Extract the mint amount from input args. */
    getAmount: (args: TArgs) => number;
    /** Optional: submit an audit trail message after minting. */
    submitAudit?: (
        config: TConfig,
        args: TArgs,
        mintResult: { transactionId: string; tokenId: string; amount: number }
    ) => Promise<{ consensusTimestamp?: string | null }>;
}

/**
 * Creates a reusable mint-token-asset function.
 *
 * The returned function handles: get token ID → mint tokens →
 * submit audit → return standardized result.
 */
export function createMintTokenAsset<TConfig extends HederaConfig, TArgs>(
    options: MintTokenAssetOptions<TConfig, TArgs>
) {
    return async (args: TArgs, config: TConfig): Promise<AssetOperationResult> => {
        const tokenId = options.getTokenId(config);
        const amount = options.getAmount(args);

        const mintResult = await mintToken(config, tokenId, amount);

        let auditTimestamp: string | null = null;
        if (options.submitAudit) {
            const auditResult = await options.submitAudit(config, args, {
                transactionId: mintResult.transactionId,
                tokenId,
                amount,
            });
            auditTimestamp = auditResult.consensusTimestamp ?? null;
        }

        return {
            success: true,
            schemaType: options.schemaType,
            assetType: options.assetType,
            amount,
            transactionId: mintResult.transactionId,
            tokenId,
            auditTimestamp,
        };
    };
}
