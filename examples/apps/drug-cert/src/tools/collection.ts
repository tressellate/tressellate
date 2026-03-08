import type { MCPTool } from '@trellis-mcp/core/config';
import { createNFTCollection, mintNFT } from '@trellis-mcp/core';
import { requireConfigField, createAuditSubmitter } from '@trellis-mcp/core/helpers';
import type { DrugCertConfig } from '../config.js';

const requireDrugCertCollectionId = requireConfigField<DrugCertConfig>(
	'drugCertCollectionId', 'Drug cert collection ID not configured. Set HEDERA_DRUG_CERT_COLLECTION_ID or use drug_cert_create_collection first.'
);

const submitDrugCertAudit = createAuditSubmitter<DrugCertConfig>(
	(config) => config.drugCertAuditTopicId, 'drug-cert'
);

export const DRUG_CERT_COLLECTION_TOOLS: MCPTool<DrugCertConfig>[] = [
	{
		name: 'drug_cert_create_collection',
		description: 'Creates the Drug Lot Certification NFT collection on Hedera Token Service. One-time setup. Returns the token ID to store in HEDERA_DRUG_CERT_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', default: 'Drug Lot Certificates' },
				tokenSymbol: { type: 'string', default: 'DRUG' },
				maxSupply: { type: 'number', description: 'Maximum certificates (omit for unlimited)' },
				memo: { type: 'string', default: 'Drug lot certification - NFT-backed pharmaceutical records' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Drug Lot Certificates',
				tokenSymbol: (args.tokenSymbol as string) ?? 'DRUG',
				maxSupply: args.maxSupply as number | undefined,
				memo: (args.memo as string) ?? 'Drug lot certification - NFT-backed pharmaceutical records'
			});
			await submitDrugCertAudit(config, { event: 'DRUG_CERT_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Drug cert collection created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'drug_cert_certify_lot',
		description: 'Certifies a drug lot by minting an NFT with lot, NDC, manufacturer, and GMP compliance metadata.',
		inputSchema: {
			type: 'object',
			properties: {
				lotNumber: { type: 'string', description: 'Drug lot number' },
				ndc: { type: 'string', description: 'National Drug Code' },
				drugName: { type: 'string', description: 'Drug name' },
				classification: { type: 'string', description: 'Drug classification (OTC, PRESCRIPTION, CONTROLLED, BIOLOGIC)' },
				manufacturer: { type: 'string', description: 'Manufacturer name' },
				dosageForm: { type: 'string', description: 'Dosage form (e.g. tablet, capsule, injection)' },
				strength: { type: 'string', description: 'Drug strength (e.g. 500mg, 10mg/mL)' },
				expirationDate: { type: 'string', description: 'Expiration date (ISO 8601)' },
				gmpCompliant: { type: 'boolean', description: 'GMP compliance status', default: true }
			},
			required: ['lotNumber', 'ndc', 'drugName', 'classification', 'manufacturer', 'dosageForm', 'strength', 'expirationDate']
		},
		implementation: async (args, config) => {
			const collectionId = requireDrugCertCollectionId(config);
			const metadata = JSON.stringify({
				type: 'DRUG_LOT_CERT', lotNumber: args.lotNumber, ndc: args.ndc,
				drugName: args.drugName, classification: args.classification,
				manufacturer: args.manufacturer, dosageForm: args.dosageForm,
				strength: args.strength, expirationDate: args.expirationDate,
				certifiedAt: new Date().toISOString(),
				gmpCompliant: (args.gmpCompliant as boolean) ?? true
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitDrugCertAudit(config, {
				event: 'DRUG_LOT_CERTIFIED', lotNumber: args.lotNumber,
				ndc: args.ndc, drugName: args.drugName, serialNumber,
				mintTxId: mintResult.transactionId
			});
			return { success: true, serialNumber, transactionId: mintResult.transactionId, lotNumber: args.lotNumber, drugName: args.drugName };
		}
	}
];
