import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { LeaseConfig } from '../config.js';

const requireLeaseAuditTopicId = requireConfigField<LeaseConfig>(
	'leaseAuditTopicId',
	'Lease audit topic ID not configured. Set HEDERA_LEASE_AUDIT_TOPIC_ID.'
);

export const LEASE_AUDIT_TOOLS: MCPTool<LeaseConfig>[] = [
	{
		name: 'lease_get_audit',
		description: `Retrieves audit trail messages for lease agreements.
Returns timestamped records of lease grants, payments, and lifecycle events.`,
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: LeaseConfig) => {
			const topicId = requireLeaseAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
