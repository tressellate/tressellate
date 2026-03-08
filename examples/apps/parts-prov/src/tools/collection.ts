import type { MCPTool } from '@trellis-mcp/core/config';
import { createNFTCollection, mintNFT } from '@trellis-mcp/core';
import { requireConfigField, createAuditSubmitter } from '@trellis-mcp/core/helpers';
import type { PartsProvConfig } from '../config.js';

const requirePartsCollectionId = requireConfigField<PartsProvConfig>(
	'partsCollectionId',
	'Parts collection ID not configured. Set HEDERA_PARTS_COLLECTION_ID or use parts_prov_create_collection first.'
);

const submitPartsAudit = createAuditSubmitter<PartsProvConfig>(
	(config) => config.partsAuditTopicId,
	'parts-prov'
);

export const PARTS_PROV_COLLECTION_TOOLS: MCPTool<PartsProvConfig>[] = [
	{
		name: 'parts_prov_create_collection',
		description: 'Creates the Parts Provenance NFT collection on Hedera Token Service. One-time setup. Returns the token ID to store in HEDERA_PARTS_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', description: 'Collection name', default: 'Parts Provenance' },
				tokenSymbol: { type: 'string', description: 'Collection symbol', default: 'PART' },
				maxSupply: { type: 'number', description: 'Maximum parts (omit for unlimited)' },
				memo: { type: 'string', description: 'Collection description', default: 'Supply chain parts provenance - NFT-backed traceability' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Parts Provenance',
				tokenSymbol: (args.tokenSymbol as string) ?? 'PART',
				maxSupply: args.maxSupply as number | undefined,
				memo: (args.memo as string) ?? 'Supply chain parts provenance - NFT-backed traceability'
			});
			await submitPartsAudit(config, { event: 'PARTS_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Parts provenance collection created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'parts_prov_record',
		description: 'Records parts provenance by minting an NFT with manufacturing and material metadata.',
		inputSchema: {
			type: 'object',
			properties: {
				partNumber: { type: 'string', description: 'Part number' },
				batchId: { type: 'string', description: 'Manufacturing batch ID' },
				materialType: { type: 'string', description: 'Material type (STEEL, ALUMINUM, PLASTIC, COMPOSITE, ELECTRONIC, OTHER)' },
				supplierId: { type: 'string', description: 'Supplier identifier' },
				manufacturingDate: { type: 'string', description: 'Manufacturing date (ISO 8601)' },
				facilityId: { type: 'string', description: 'Manufacturing facility ID' },
				originCountry: { type: 'string', description: 'Country of origin (ISO 3166-1 alpha-2)' }
			},
			required: ['partNumber', 'batchId', 'materialType', 'supplierId', 'manufacturingDate', 'facilityId', 'originCountry']
		},
		implementation: async (args, config) => {
			const collectionId = requirePartsCollectionId(config);
			const metadata = JSON.stringify({
				type: 'PARTS_PROVENANCE',
				partNumber: args.partNumber, batchId: args.batchId, materialType: args.materialType,
				supplierId: args.supplierId, manufacturingDate: args.manufacturingDate,
				facilityId: args.facilityId, originCountry: args.originCountry,
				recordedAt: new Date().toISOString()
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitPartsAudit(config, {
				event: 'PARTS_PROVENANCE_RECORDED', partNumber: args.partNumber,
				batchId: args.batchId, serialNumber, mintTxId: mintResult.transactionId
			});
			return { success: true, serialNumber, transactionId: mintResult.transactionId, partNumber: args.partNumber, batchId: args.batchId };
		}
	}
];
