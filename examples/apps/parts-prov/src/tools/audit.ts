import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { PartsProvConfig } from '../config.js';

const requirePartsAuditTopicId = requireConfigField<PartsProvConfig>(
	'partsAuditTopicId', 'Parts audit topic ID not configured. Set HEDERA_PARTS_AUDIT_TOPIC_ID.'
);

export const PARTS_PROV_AUDIT_TOOLS: MCPTool<PartsProvConfig>[] = [
	{
		name: 'parts_prov_get_audit',
		description: 'Retrieves audit trail messages for parts provenance and quality certifications.',
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: PartsProvConfig) => {
			const topicId = requirePartsAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
