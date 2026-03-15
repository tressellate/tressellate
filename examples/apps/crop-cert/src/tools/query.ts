import type { MCPTool } from '@tressellate/core/config';
import { getNFTInfo, getAccountNFTs } from '@tressellate/core/tools/nft';
import { requireConfigField } from '@tressellate/core/helpers';
import type { CropCertConfig } from '../config.js';

const requireCropCertCollectionId = requireConfigField<CropCertConfig>(
	'cropCertCollectionId',
	'Crop cert collection ID not configured. Set HEDERA_CROP_CERT_COLLECTION_ID.'
);

export const CROP_CERT_QUERY_TOOLS: MCPTool<CropCertConfig>[] = [
	{
		name: 'crop_cert_verify',
		description: `Verifies a crop yield certificate by retrieving and parsing its NFT metadata.
Returns the full certificate details including farm, crop, yield, and certification standard.`,
		inputSchema: {
			type: 'object',
			properties: {
				serialNumber: { type: 'number', description: 'Certificate NFT serial number' }
			},
			required: ['serialNumber']
		},
		implementation: async (args, config: CropCertConfig) => {
			const collectionId = requireCropCertCollectionId(config);
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);

			if (!nftInfo || !nftInfo.metadata) {
				return { valid: false, reason: 'Certificate not found or has no metadata' };
			}

			try {
				const metadata = JSON.parse(nftInfo.metadata);
				return {
					valid: true,
					serialNumber: args.serialNumber,
					collectionId,
					metadata,
					owner: nftInfo.accountId
				};
			} catch {
				return { valid: false, reason: 'Certificate metadata is not valid JSON' };
			}
		}
	},
	{
		name: 'crop_cert_list_by_farm',
		description: `Lists all crop yield certificate NFTs held by a farm account.
Returns certificate details for each NFT in the collection held by the account.`,
		inputSchema: {
			type: 'object',
			properties: {
				accountId: { type: 'string', description: 'Hedera account ID of the farm' }
			},
			required: ['accountId']
		},
		implementation: async (args, config: CropCertConfig) => {
			const collectionId = requireCropCertCollectionId(config);
			const nftsResult = await getAccountNFTs(config, args.accountId as string, collectionId);

			const certificates = (nftsResult.nfts || []).map((nft: Record<string, unknown>) => {
				try {
					return {
						serialNumber: nft.serialNumber,
						metadata: nft.metadata ? JSON.parse(nft.metadata as string) : null
					};
				} catch {
					return { serialNumber: nft.serialNumber, metadata: null };
				}
			});

			return {
				accountId: args.accountId,
				collectionId,
				totalCertificates: certificates.length,
				certificates
			};
		}
	}
];
