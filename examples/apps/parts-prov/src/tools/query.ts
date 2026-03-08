import type { MCPTool } from '@trellis-mcp/core/config';
import { getNFTInfo } from '@trellis-mcp/core/tools/nft';
import { submitTopicMessage } from '@trellis-mcp/core/tools/consensus';
import { requireConfigField } from '@trellis-mcp/core/helpers';
import type { PartsProvConfig } from '../config.js';

const requirePartsCollectionId = requireConfigField<PartsProvConfig>(
	'partsCollectionId', 'Parts collection ID not configured. Set HEDERA_PARTS_COLLECTION_ID.'
);
const requirePartsAuditTopicId = requireConfigField<PartsProvConfig>(
	'partsAuditTopicId', 'Parts audit topic ID not configured. Set HEDERA_PARTS_AUDIT_TOPIC_ID.'
);

export const PARTS_PROV_QUERY_TOOLS: MCPTool<PartsProvConfig>[] = [
	{
		name: 'parts_prov_verify',
		description: 'Verifies parts provenance by retrieving and parsing the NFT metadata. Returns full provenance details.',
		inputSchema: {
			type: 'object',
			properties: { serialNumber: { type: 'number', description: 'Provenance NFT serial number' } },
			required: ['serialNumber']
		},
		implementation: async (args, config: PartsProvConfig) => {
			const collectionId = requirePartsCollectionId(config);
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);
			if (!nftInfo || !nftInfo.metadata) return { valid: false, reason: 'Provenance record not found' };
			try {
				const metadata = JSON.parse(nftInfo.metadata);
				return { valid: true, serialNumber: args.serialNumber, collectionId, metadata, owner: nftInfo.accountId };
			} catch { return { valid: false, reason: 'Metadata is not valid JSON' }; }
		}
	},
	{
		name: 'parts_prov_certify_quality',
		description: 'Records a quality certification for a parts batch to the audit trail.',
		inputSchema: {
			type: 'object',
			properties: {
				partNumber: { type: 'string', description: 'Part number' },
				batchRef: { type: 'string', description: 'Batch reference (provenance NFT serial)' },
				qualityGrade: { type: 'string', description: 'Quality grade (A, B, C, REJECTED)' },
				inspectorId: { type: 'string', description: 'Inspector identifier' }
			},
			required: ['partNumber', 'batchRef', 'qualityGrade', 'inspectorId']
		},
		implementation: async (args, config: PartsProvConfig) => {
			const topicId = requirePartsAuditTopicId(config);
			return submitTopicMessage(config, topicId, {
				event: 'QUALITY_CERTIFIED', type: 'QUALITY_CERT',
				partNumber: args.partNumber, batchRef: args.batchRef,
				qualityGrade: args.qualityGrade, inspectorId: args.inspectorId,
				certifiedAt: new Date().toISOString(), domain: 'parts-prov'
			});
		}
	}
];
