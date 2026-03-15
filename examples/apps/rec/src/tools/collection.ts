import type { MCPTool } from '@tressellate/core/config';
import { createToken, mintToken, createNFTCollection } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { RECConfig } from '../config.js';

const requireRecTokenId = requireConfigField<RECConfig>(
	'recTokenId', 'REC token ID not configured. Set HEDERA_REC_TOKEN_ID or use rec_create_token first.'
);

const submitRecAudit = createAuditSubmitter<RECConfig>(
	(config) => config.recAuditTopicId, 'rec'
);

export const REC_COLLECTION_TOOLS: MCPTool<RECConfig>[] = [
	{
		name: 'rec_create_token',
		description: 'Creates the fungible REC token on Hedera Token Service. Each token unit represents 1 MWh of renewable energy. Returns the token ID to store in HEDERA_REC_TOKEN_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', description: 'Token name', default: 'Renewable Energy Credit' },
				tokenSymbol: { type: 'string', description: 'Token symbol', default: 'REC' },
				decimals: { type: 'number', description: 'Decimal places', default: 0 },
				initialSupply: { type: 'number', description: 'Initial supply', default: 0 }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createToken(config, {
				tokenName: (args.tokenName as string) ?? 'Renewable Energy Credit',
				tokenSymbol: (args.tokenSymbol as string) ?? 'REC',
				decimals: (args.decimals as number) ?? 0,
				initialSupply: (args.initialSupply as number) ?? 0
			});
			await submitRecAudit(config, { event: 'REC_TOKEN_CREATED', tokenId: result.tokenId });
			return { ...result, message: `REC token created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'rec_create_cert_collection',
		description: 'Creates the Generation Certificate NFT collection. Each NFT certifies energy generation for a period. Returns token ID to store in HEDERA_REC_CERT_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', default: 'Generation Certificates' },
				tokenSymbol: { type: 'string', default: 'GENCERT' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Generation Certificates',
				tokenSymbol: (args.tokenSymbol as string) ?? 'GENCERT',
				memo: 'Renewable energy generation certificates'
			});
			await submitRecAudit(config, { event: 'CERT_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Generation cert collection created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'rec_mint_credits',
		description: 'Mints fungible REC tokens representing verified renewable energy generation. Audits the issuance.',
		inputSchema: {
			type: 'object',
			properties: {
				amount: { type: 'number', description: 'Number of REC tokens to mint (1 token = 1 MWh)' },
				generatorId: { type: 'string', description: 'Generator facility identifier' },
				energySource: { type: 'string', description: 'Energy source (SOLAR, WIND, HYDRO, GEOTHERMAL, BIOMASS)' },
				vintage: { type: 'number', description: 'Generation year' },
				verificationBody: { type: 'string', description: 'Verification body (GREEN_E, I_REC, GO_EU, INTERNAL)' }
			},
			required: ['amount', 'generatorId', 'energySource', 'vintage', 'verificationBody']
		},
		implementation: async (args, config) => {
			const tokenId = requireRecTokenId(config);
			const result = await mintToken(config, tokenId, args.amount as number);
			await submitRecAudit(config, {
				event: 'REC_CREDITS_MINTED', schema: 'REC_CREDIT',
				generatorId: args.generatorId, energySource: args.energySource,
				mwhGenerated: args.amount, vintage: args.vintage,
				verificationBody: args.verificationBody, tokenId, mintTxId: result.transactionId,
				issuedAt: new Date().toISOString()
			});
			return { success: true, tokenId, amount: args.amount, transactionId: result.transactionId };
		}
	}
];
