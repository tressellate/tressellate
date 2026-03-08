import type { MCPTool } from '@trellis-mcp/core/config';
import { mintNFT } from '@trellis-mcp/core';
import { getTokenBalance } from '@trellis-mcp/core/tools/query';
import { requireConfigField, createAuditSubmitter } from '@trellis-mcp/core/helpers';
import type { RECConfig } from '../config.js';

const requireRecTokenId = requireConfigField<RECConfig>(
	'recTokenId', 'REC token ID not configured. Set HEDERA_REC_TOKEN_ID.'
);
const requireRecCertCollectionId = requireConfigField<RECConfig>(
	'recCertCollectionId', 'REC cert collection ID not configured. Set HEDERA_REC_CERT_COLLECTION_ID.'
);
const submitRecAudit = createAuditSubmitter<RECConfig>(
	(config) => config.recAuditTopicId, 'rec'
);

export const REC_QUERY_TOOLS: MCPTool<RECConfig>[] = [
	{
		name: 'rec_issue_generation_cert',
		description: 'Issues a generation certificate NFT with energy production data for a metering period.',
		inputSchema: {
			type: 'object',
			properties: {
				facilityId: { type: 'string', description: 'Generation facility ID' },
				energySource: { type: 'string', description: 'Energy source type' },
				capacityKw: { type: 'number', description: 'Facility capacity in kW' },
				meterReadingStart: { type: 'number', description: 'Meter reading at period start (kWh)' },
				meterReadingEnd: { type: 'number', description: 'Meter reading at period end (kWh)' },
				periodStart: { type: 'string', description: 'Period start date (ISO 8601)' },
				periodEnd: { type: 'string', description: 'Period end date (ISO 8601)' }
			},
			required: ['facilityId', 'energySource', 'capacityKw', 'meterReadingStart', 'meterReadingEnd', 'periodStart', 'periodEnd']
		},
		implementation: async (args, config: RECConfig) => {
			const collectionId = requireRecCertCollectionId(config);
			const metadata = JSON.stringify({
				type: 'GENERATION_CERT', facilityId: args.facilityId, energySource: args.energySource,
				capacityKw: args.capacityKw, meterReadingStart: args.meterReadingStart,
				meterReadingEnd: args.meterReadingEnd, periodStart: args.periodStart,
				periodEnd: args.periodEnd, certifiedAt: new Date().toISOString()
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			await submitRecAudit(config, {
				event: 'GENERATION_CERT_ISSUED', facilityId: args.facilityId,
				serialNumber: mintResult.serialNumbers[0], mintTxId: mintResult.transactionId
			});
			return { success: true, serialNumber: mintResult.serialNumbers[0], transactionId: mintResult.transactionId };
		}
	},
	{
		name: 'rec_get_balance',
		description: 'Queries the REC token balance for an account. Returns the number of RECs (MWh) held.',
		inputSchema: {
			type: 'object',
			properties: { accountId: { type: 'string', description: 'Hedera account ID' } },
			required: ['accountId']
		},
		implementation: async (args, config: RECConfig) => {
			const tokenId = requireRecTokenId(config);
			return getTokenBalance(config, tokenId, args.accountId as string);
		}
	}
];
