import type { HederaConfig } from '@tressellate/core/config';
import { mintNFT, transferNFT, burnNFT } from '@tressellate/core';

/**
 * Configuration for agreement lifecycle operations.
 *
 * This encapsulates the grant (mint+transfer) and revoke (burn) patterns
 * used by NFT-gated access control.
 *
 * Used by: nda_grant_access, nda_revoke_access
 */
export interface AgreementLifecycleOptions<TConfig extends HederaConfig> {
    /** Extract the NFT collection ID from config, or throw if missing. */
    getCollectionId: (config: TConfig) => string;
    /** Optional: submit an audit trail message after grant/revoke. */
    submitAudit?: (
        config: TConfig,
        message: Record<string, unknown>
    ) => Promise<{ consensusTimestamp?: string | null }>;
}

export interface GrantResult {
    success: boolean;
    serialNumber: number;
    mintTransactionId: string;
    transferTransactionId: string;
    auditTimestamp?: string | null;
}

export interface RevokeResult {
    success: boolean;
    serialNumber: number;
    burnTransactionId: string;
    auditTimestamp?: string | null;
}

/**
 * Creates grant and revoke functions for NFT-gated agreement lifecycle.
 */
export function createAgreementLifecycle<TConfig extends HederaConfig>(
    options: AgreementLifecycleOptions<TConfig>
) {
    return {
        /**
         * Grant access: mint an NFT with agreement metadata, then transfer to recipient.
         */
        grant: async (
            config: TConfig,
            recipientAccountId: string,
            metadata: Record<string, unknown>
        ): Promise<GrantResult> => {
            const collectionId = options.getCollectionId(config);

            const mintResult = await mintNFT(
                config,
                collectionId,
                [JSON.stringify(metadata)]
            );
            const serialNumber = mintResult.serialNumbers[0];

            const transferResult = await transferNFT(
                config,
                collectionId,
                config.operatorAccountId,
                recipientAccountId,
                serialNumber
            );

            let auditTimestamp: string | null = null;
            if (options.submitAudit) {
                const auditResult = await options.submitAudit(config, {
                    event: 'ACCESS_GRANTED',
                    recipientAccountId,
                    serialNumber,
                    metadata,
                    mintTxId: mintResult.transactionId,
                    transferTxId: transferResult.transactionId,
                });
                auditTimestamp = auditResult.consensusTimestamp ?? null;
            }

            return {
                success: true,
                serialNumber,
                mintTransactionId: mintResult.transactionId,
                transferTransactionId: transferResult.transactionId,
                auditTimestamp,
            };
        },

        /**
         * Revoke access: burn an NFT by serial number.
         */
        revoke: async (
            config: TConfig,
            serialNumber: number,
            reason: string
        ): Promise<RevokeResult> => {
            const collectionId = options.getCollectionId(config);

            const burnResult = await burnNFT(config, collectionId, [serialNumber]);

            let auditTimestamp: string | null = null;
            if (options.submitAudit) {
                const auditResult = await options.submitAudit(config, {
                    event: 'ACCESS_REVOKED',
                    serialNumber,
                    reason,
                    txId: burnResult.transactionId,
                });
                auditTimestamp = auditResult.consensusTimestamp ?? null;
            }

            return {
                success: true,
                serialNumber,
                burnTransactionId: burnResult.transactionId,
                auditTimestamp,
            };
        },
    };
}
