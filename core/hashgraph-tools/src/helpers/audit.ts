import type { HederaConfig } from '../config.js';
import { submitTopicMessage } from '../tools/consensus.js';

/**
 * Creates a domain-scoped audit submitter.
 * Replaces submitBcbAudit, submitIcsAudit, submitNdaAudit, etc.
 *
 * @param getTopicId - Function to extract the audit topic ID from config
 * @param domainTag - Domain identifier added to every audit message (e.g. 'bcb', 'ics', 'nda')
 */
export function createAuditSubmitter<TConfig extends HederaConfig>(
    getTopicId: (config: TConfig) => string | undefined,
    domainTag: string
) {
    return async (config: TConfig, message: Record<string, unknown>) => {
        const topicId = getTopicId(config);
        if (!topicId) return { consensusTimestamp: null };
        return submitTopicMessage(config, topicId, {
            ...message,
            timestamp: new Date().toISOString(),
            network: config.network,
            domain: domainTag
        });
    };
}
