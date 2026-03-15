import type { HederaConfig } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core';
import type { AuditTrailQuery, AuditTrailResult, AuditTrailMessage } from '../types.js';

/**
 * Configuration for a query-audit-trail operation factory.
 *
 * This encapsulates the common pattern:
 *   get topic ID → fetch messages → client-side filter by schema type → return
 *
 * Used by: bcb_audit_trail, ics_audit_trail, nda_get_audit_messages, hours_get_audit_messages
 */
export interface QueryAuditTrailOptions<TConfig extends HederaConfig> {
    /** Extract the audit topic ID from config, or throw if missing. */
    getTopicId: (config: TConfig) => string;
}

/**
 * Creates a reusable query-audit-trail function.
 */
export function createQueryAuditTrail<TConfig extends HederaConfig>(
    options: QueryAuditTrailOptions<TConfig>
) {
    return async (
        query: AuditTrailQuery,
        config: TConfig
    ): Promise<AuditTrailResult> => {
        const topicId = options.getTopicId(config);

        const result = await getTopicMessages(config, topicId, {
            limit: query.limit ?? 100,
            order: query.order ?? 'desc',
        });

        let messages: AuditTrailMessage[] = result.messages.map(
            (msg: { consensus_timestamp: string; message: string; sequence_number: number }) => {
                let parsed: Record<string, unknown>;
                try {
                    const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
                    parsed = JSON.parse(decoded);
                } catch {
                    parsed = { raw: msg.message };
                }
                return {
                    consensusTimestamp: msg.consensus_timestamp,
                    message: parsed,
                    sequenceNumber: msg.sequence_number,
                };
            }
        );

        // Client-side filter by schema type if specified
        if (query.schemaType) {
            messages = messages.filter(
                (m) => (m.message as Record<string, unknown>).schema === query.schemaType
                    || (m.message as Record<string, unknown>).type === query.schemaType
            );
        }

        return {
            topicId,
            messages,
            count: messages.length,
        };
    };
}
