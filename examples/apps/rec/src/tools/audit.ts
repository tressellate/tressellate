import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { RECConfig } from '../config.js';

const requireRecAuditTopicId = requireConfigField<RECConfig>(
	'recAuditTopicId', 'REC audit topic ID not configured. Set HEDERA_REC_AUDIT_TOPIC_ID.'
);

export const REC_AUDIT_TOOLS: MCPTool<RECConfig>[] = [
	{
		name: 'rec_get_audit',
		description: 'Retrieves audit trail messages for renewable energy credit issuance and generation certificates.',
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: RECConfig) => {
			const topicId = requireRecAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
