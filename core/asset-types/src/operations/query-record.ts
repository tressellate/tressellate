import type { HederaConfig } from '@trellis-mcp/core/config';
import { getNFTInfo } from '@trellis-mcp/core';

/**
 * Configuration for a query-record operation factory.
 *
 * This encapsulates the common pattern:
 *   map schema type → collection ID → getNFTInfo → parse metadata → return
 *
 * Used by: bcb_query_record, ics_query_guardian_record
 */
export interface QueryRecordOptions<TConfig extends HederaConfig> {
    /** Map a schema type string to its collection ID from config. */
    getCollectionId: (config: TConfig, schemaType: string) => string;
    /** Supported schema types for this domain. */
    supportedSchemas: string[];
}

/** Result of a record query. */
export interface QueryRecordResult {
    schemaType: string;
    collectionId: string;
    serialNumber: number;
    accountId?: string;
    metadata: Record<string, unknown>;
    createdTimestamp?: string;
    modifiedTimestamp?: string;
    deleted?: boolean;
}

/**
 * Creates a reusable query-record function.
 */
export function createQueryRecord<TConfig extends HederaConfig>(
    options: QueryRecordOptions<TConfig>
) {
    return async (
        schemaType: string,
        serialNumber: number,
        config: TConfig
    ): Promise<QueryRecordResult> => {
        if (!options.supportedSchemas.includes(schemaType)) {
            throw new Error(
                `Unknown schema type: ${schemaType}. Supported: ${options.supportedSchemas.join(', ')}`
            );
        }

        const collectionId = options.getCollectionId(config, schemaType);
        const info = await getNFTInfo(config, collectionId, serialNumber);

        // getNFTInfo already base64-decodes metadata to a string
        let metadata: Record<string, unknown> = {};
        if (info.metadata) {
            try {
                metadata = JSON.parse(info.metadata);
            } catch {
                metadata = { raw: info.metadata };
            }
        }

        return {
            schemaType,
            collectionId,
            serialNumber,
            accountId: info.accountId,
            metadata,
            createdTimestamp: info.createdTimestamp,
            modifiedTimestamp: info.modifiedTimestamp,
            deleted: info.deleted,
        };
    };
}
