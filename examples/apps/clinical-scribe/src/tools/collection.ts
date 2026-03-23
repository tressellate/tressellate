import type { MCPTool } from '@tressellate/core/config';
import { createNFTCollection } from '@tressellate/core';
import { createAuditSubmitter } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const submitClinicalAudit = createAuditSubmitter<ClinicalScribeConfig>(
	(config) => config.clinicalAuditTopicId, 'clinical-scribe'
);

export const CLINICAL_COLLECTION_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_create_note_collection',
		description: 'Creates the Clinical Notes NFT collection on Hedera Token Service. One-time setup. Returns the token ID to store in HEDERA_CLINICAL_NOTE_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', default: 'Clinical Note Attestations' },
				tokenSymbol: { type: 'string', default: 'CLNOTE' },
				maxSupply: { type: 'number', description: 'Maximum notes (omit for unlimited)' },
				memo: { type: 'string', default: 'Clinical note attestations - NFT-backed clinical documentation' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Clinical Note Attestations',
				tokenSymbol: (args.tokenSymbol as string) ?? 'CLNOTE',
				maxSupply: args.maxSupply as number | undefined,
				memo: (args.memo as string) ?? 'Clinical note attestations - NFT-backed clinical documentation'
			});
			await submitClinicalAudit(config, { event: 'NOTE_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Clinical note collection created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'clinical_create_consent_collection',
		description: 'Creates the Patient Consent NFT collection. One-time setup. Returns the token ID to store in HEDERA_PATIENT_CONSENT_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', default: 'Patient Consent Records' },
				tokenSymbol: { type: 'string', default: 'CONSENT' },
				memo: { type: 'string', default: 'Patient consent records - immutable consent tracking' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Patient Consent Records',
				tokenSymbol: (args.tokenSymbol as string) ?? 'CONSENT',
				memo: (args.memo as string) ?? 'Patient consent records - immutable consent tracking'
			});
			await submitClinicalAudit(config, { event: 'CONSENT_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Patient consent collection created. Store this token ID: ${result.tokenId}` };
		}
	},
	{
		name: 'clinical_create_claim_collection',
		description: 'Creates the Billing Claims NFT collection. One-time setup. Returns the token ID to store in HEDERA_BILLING_CLAIM_COLLECTION_ID.',
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', default: 'Billing Claims' },
				tokenSymbol: { type: 'string', default: 'CLAIM' },
				memo: { type: 'string', default: 'Billing claims - transparent claim lifecycle tracking' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Billing Claims',
				tokenSymbol: (args.tokenSymbol as string) ?? 'CLAIM',
				memo: (args.memo as string) ?? 'Billing claims - transparent claim lifecycle tracking'
			});
			await submitClinicalAudit(config, { event: 'CLAIM_COLLECTION_CREATED', tokenId: result.tokenId });
			return { ...result, message: `Billing claim collection created. Store this token ID: ${result.tokenId}` };
		}
	}
];
