import type { MCPTool } from '@trellis-mcp/core/config';
import { createNFTCollection, mintNFT } from '@trellis-mcp/core';
import { requireConfigField, createAuditSubmitter } from '@trellis-mcp/core/helpers';
import type { CropCertConfig } from '../config.js';

const requireCropCertCollectionId = requireConfigField<CropCertConfig>(
	'cropCertCollectionId',
	'Crop cert collection ID not configured. Set HEDERA_CROP_CERT_COLLECTION_ID or use crop_cert_create_collection first.'
);

const submitCropCertAudit = createAuditSubmitter<CropCertConfig>(
	(config) => config.cropCertAuditTopicId,
	'crop-cert'
);

export const CROP_CERT_COLLECTION_TOOLS: MCPTool<CropCertConfig>[] = [
	{
		name: 'crop_cert_create_collection',
		description: `Creates the Crop Yield Certificate NFT collection on Hedera Token Service.
One-time setup operation. Each minted NFT represents a certified crop yield record.
Returns the token ID to store in HEDERA_CROP_CERT_COLLECTION_ID.`,
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', description: 'Collection name', default: 'Crop Yield Certificates' },
				tokenSymbol: { type: 'string', description: 'Collection symbol', default: 'CROP' },
				maxSupply: { type: 'number', description: 'Maximum certificates (omit for unlimited)' },
				memo: { type: 'string', description: 'Collection description', default: 'Crop yield certification - NFT-backed agricultural records' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Crop Yield Certificates',
				tokenSymbol: (args.tokenSymbol as string) ?? 'CROP',
				maxSupply: args.maxSupply as number | undefined,
				memo: (args.memo as string) ?? 'Crop yield certification - NFT-backed agricultural records'
			});

			await submitCropCertAudit(config, {
				event: 'CROP_CERT_COLLECTION_CREATED',
				tokenId: result.tokenId
			});

			return {
				...result,
				message: `Crop cert collection created. Store this token ID: ${result.tokenId}`
			};
		}
	},
	{
		name: 'crop_cert_issue',
		description: `Issues a crop yield certificate by minting an NFT with harvest and certification metadata.
Records farm ID, crop category, yield, harvest date, and certification standard.
Automatically submits an audit trail entry.`,
		inputSchema: {
			type: 'object',
			properties: {
				farmId: { type: 'string', description: 'Farm identifier' },
				fieldId: { type: 'string', description: 'Field or plot identifier' },
				cropCategory: { type: 'string', description: 'Crop category (GRAIN, VEGETABLE, FRUIT, LEGUME, ROOT, OTHER)' },
				variety: { type: 'string', description: 'Crop variety name (e.g. "Jasmine Rice", "Roma Tomato")' },
				yieldKg: { type: 'number', description: 'Harvest yield in kilograms' },
				harvestDate: { type: 'string', description: 'Harvest date (ISO 8601)' },
				certificationStandard: { type: 'string', description: 'Certification standard (USDA_ORGANIC, EU_ORGANIC, GAP, RAINFOREST_ALLIANCE, INTERNAL)' },
				inspectionRef: { type: 'string', description: 'Optional reference to a soil inspection NFT serial number' }
			},
			required: ['farmId', 'fieldId', 'cropCategory', 'variety', 'yieldKg', 'harvestDate', 'certificationStandard']
		},
		implementation: async (args, config) => {
			const collectionId = requireCropCertCollectionId(config);
			const now = new Date();

			const metadata = JSON.stringify({
				type: 'CROP_YIELD_CERT',
				farmId: args.farmId,
				fieldId: args.fieldId,
				cropCategory: args.cropCategory,
				variety: args.variety,
				yieldKg: args.yieldKg,
				harvestDate: args.harvestDate,
				certificationStandard: args.certificationStandard,
				inspectionRef: args.inspectionRef ?? undefined,
				certifiedAt: now.toISOString()
			});

			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];

			await submitCropCertAudit(config, {
				event: 'CROP_YIELD_CERTIFIED',
				farmId: args.farmId,
				fieldId: args.fieldId,
				cropCategory: args.cropCategory,
				variety: args.variety,
				yieldKg: args.yieldKg,
				serialNumber,
				mintTxId: mintResult.transactionId
			});

			return {
				success: true,
				serialNumber,
				transactionId: mintResult.transactionId,
				farmId: args.farmId,
				cropCategory: args.cropCategory,
				variety: args.variety,
				yieldKg: args.yieldKg,
				certifiedAt: now.toISOString()
			};
		}
	}
];
