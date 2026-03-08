import type { MCPTool } from '@trellis-mcp/core/config';
import { getNFTInfo } from '@trellis-mcp/core/tools/nft';
import { submitTopicMessage } from '@trellis-mcp/core/tools/consensus';
import { requireConfigField } from '@trellis-mcp/core/helpers';
import type { DrugCertConfig } from '../config.js';

const requireDrugCertCollectionId = requireConfigField<DrugCertConfig>(
	'drugCertCollectionId', 'Drug cert collection ID not configured. Set HEDERA_DRUG_CERT_COLLECTION_ID.'
);
const requireDrugCertAuditTopicId = requireConfigField<DrugCertConfig>(
	'drugCertAuditTopicId', 'Drug cert audit topic not configured. Set HEDERA_DRUG_CERT_AUDIT_TOPIC_ID.'
);

export const DRUG_CERT_QUERY_TOOLS: MCPTool<DrugCertConfig>[] = [
	{
		name: 'drug_cert_verify_lot',
		description: 'Verifies a drug lot certificate by retrieving and parsing the NFT metadata. Checks expiration and GMP status.',
		inputSchema: {
			type: 'object',
			properties: { serialNumber: { type: 'number', description: 'Certificate NFT serial number' } },
			required: ['serialNumber']
		},
		implementation: async (args, config: DrugCertConfig) => {
			const collectionId = requireDrugCertCollectionId(config);
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);
			if (!nftInfo || !nftInfo.metadata) return { valid: false, reason: 'Certificate not found' };
			try {
				const metadata = JSON.parse(nftInfo.metadata);
				const expired = new Date(metadata.expirationDate) < new Date();
				return {
					valid: !expired && metadata.gmpCompliant,
					expired, gmpCompliant: metadata.gmpCompliant,
					serialNumber: args.serialNumber, collectionId,
					metadata, owner: nftInfo.accountId
				};
			} catch { return { valid: false, reason: 'Invalid metadata' }; }
		}
	},
	{
		name: 'drug_cert_record_shipment',
		description: 'Records a supply chain custody transfer step for a drug lot to the audit trail.',
		inputSchema: {
			type: 'object',
			properties: {
				lotRef: { type: 'string', description: 'Lot certificate serial number reference' },
				fromFacility: { type: 'string', description: 'Originating facility' },
				toFacility: { type: 'string', description: 'Destination facility' },
				storageCondition: { type: 'string', description: 'Storage condition (ROOM_TEMP, REFRIGERATED, FROZEN, CONTROLLED_SUBSTANCE)' },
				tempMin: { type: 'number', description: 'Minimum temperature during transit (°C)' },
				tempMax: { type: 'number', description: 'Maximum temperature during transit (°C)' }
			},
			required: ['lotRef', 'fromFacility', 'toFacility', 'storageCondition', 'tempMin', 'tempMax']
		},
		implementation: async (args, config: DrugCertConfig) => {
			const topicId = requireDrugCertAuditTopicId(config);
			return submitTopicMessage(config, topicId, {
				event: 'SHIPMENT_RECORDED', type: 'SUPPLY_CHAIN_STEP',
				lotRef: args.lotRef, fromFacility: args.fromFacility,
				toFacility: args.toFacility, storageCondition: args.storageCondition,
				tempMin: args.tempMin, tempMax: args.tempMax,
				shippedAt: new Date().toISOString(), domain: 'drug-cert'
			});
		}
	}
];
