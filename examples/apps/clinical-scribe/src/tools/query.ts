import type { MCPTool } from '@tressellate/core/config';
import { getNFTInfo } from '@tressellate/core/tools/nft';
import { requireConfigField } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const requireNoteCollectionId = requireConfigField<ClinicalScribeConfig>(
	'clinicalNoteCollectionId', 'Clinical note collection ID not configured. Set HEDERA_CLINICAL_NOTE_COLLECTION_ID.'
);

const requireConsentCollectionId = requireConfigField<ClinicalScribeConfig>(
	'patientConsentCollectionId', 'Patient consent collection ID not configured. Set HEDERA_PATIENT_CONSENT_COLLECTION_ID.'
);

export const CLINICAL_QUERY_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_verify_note',
		description: 'Verifies a clinical note attestation by retrieving the NFT metadata. Confirms the note content hash matches, the attesting clinician, and whether it was AI-generated.',
		inputSchema: {
			type: 'object',
			properties: {
				serialNumber: { type: 'number', description: 'Clinical note NFT serial number' }
			},
			required: ['serialNumber']
		},
		implementation: async (args, config: ClinicalScribeConfig) => {
			const collectionId = requireNoteCollectionId(config);
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);
			if (!nftInfo || !nftInfo.metadata) return { valid: false, reason: 'Note attestation not found' };
			try {
				const metadata = JSON.parse(nftInfo.metadata);
				return {
					valid: true,
					clinicianAttested: metadata.clinicianAttested,
					aiGenerated: metadata.aiGenerated,
					noteFormat: metadata.noteFormat,
					specialty: metadata.specialty,
					encounterId: metadata.encounterId,
					encounterDate: metadata.encounterDate,
					contentHash: metadata.contentHash,
					icdCodes: metadata.icdCodes,
					cptCodes: metadata.cptCodes,
					serialNumber: args.serialNumber,
					collectionId,
					owner: nftInfo.accountId
				};
			} catch { return { valid: false, reason: 'Invalid metadata' }; }
		}
	},
	{
		name: 'clinical_verify_consent',
		description: 'Verifies a patient consent record. Checks consent scopes, expiration, and revocability.',
		inputSchema: {
			type: 'object',
			properties: {
				serialNumber: { type: 'number', description: 'Consent NFT serial number' }
			},
			required: ['serialNumber']
		},
		implementation: async (args, config: ClinicalScribeConfig) => {
			const collectionId = requireConsentCollectionId(config);
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);
			if (!nftInfo || !nftInfo.metadata) return { valid: false, reason: 'Consent record not found' };
			try {
				const metadata = JSON.parse(nftInfo.metadata);
				const expired = metadata.expiresAt ? new Date(metadata.expiresAt) < new Date() : false;
				return {
					valid: !expired,
					expired,
					consentScopes: metadata.consentScopes,
					consentMethod: metadata.consentMethod,
					grantedAt: metadata.grantedAt,
					expiresAt: metadata.expiresAt,
					revocable: metadata.revocable,
					serialNumber: args.serialNumber,
					collectionId,
					owner: nftInfo.accountId
				};
			} catch { return { valid: false, reason: 'Invalid metadata' }; }
		}
	}
];
