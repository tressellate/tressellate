import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { DrugCertConfig } from '../config.js';

const requireDrugCertAuditTopicId = requireConfigField<DrugCertConfig>(
	'drugCertAuditTopicId', 'Drug cert audit topic not configured. Set HEDERA_DRUG_CERT_AUDIT_TOPIC_ID.'
);

export const DRUG_CERT_AUDIT_TOOLS: MCPTool<DrugCertConfig>[] = [
	{
		name: 'drug_cert_get_audit',
		description: 'Retrieves audit trail messages for drug lot certifications and supply chain custody events.',
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: DrugCertConfig) => {
			const topicId = requireDrugCertAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
