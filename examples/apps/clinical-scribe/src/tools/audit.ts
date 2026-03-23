import type { MCPTool } from '@tressellate/core/config';
import { getTopicMessages } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const requireClinicalAuditTopicId = requireConfigField<ClinicalScribeConfig>(
	'clinicalAuditTopicId', 'Clinical audit topic not configured. Set HEDERA_CLINICAL_AUDIT_TOPIC_ID.'
);

export const CLINICAL_AUDIT_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_get_audit',
		description: 'Retrieves the full audit trail for clinical documentation events: note attestations, consent records, billing claims, assessments, and provenance changes. Every clinical action is transparently logged on Hedera Consensus Service.',
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
				order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
			},
			required: []
		},
		implementation: async (args, config: ClinicalScribeConfig) => {
			const topicId = requireClinicalAuditTopicId(config);
			return getTopicMessages(config, topicId, {
				limit: args.limit as number | undefined,
				order: args.order as string | undefined
			});
		}
	}
];
