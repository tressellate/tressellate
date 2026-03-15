import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { CropCertConfig } from '../config.js';

const requireCropCertAuditTopicId = requireConfigField<CropCertConfig>(
	'cropCertAuditTopicId',
	'Crop cert audit topic ID not configured. Set HEDERA_CROP_CERT_AUDIT_TOPIC_ID.'
);

export const CROP_CERT_AUDIT_TOOLS: MCPTool<CropCertConfig>[] = [
	{
		name: 'crop_cert_get_audit',
		description: `Retrieves audit trail messages for crop yield certifications.
Returns timestamped records of certificate issuance and collection events.`,
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: CropCertConfig) => {
			const topicId = requireCropCertAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
