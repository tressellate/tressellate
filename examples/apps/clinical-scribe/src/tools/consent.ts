import type { MCPTool } from '@tressellate/core/config';
import { mintNFT } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const requireConsentCollectionId = requireConfigField<ClinicalScribeConfig>(
	'patientConsentCollectionId', 'Patient consent collection ID not configured. Set HEDERA_PATIENT_CONSENT_COLLECTION_ID or use clinical_create_consent_collection first.'
);

const submitClinicalAudit = createAuditSubmitter<ClinicalScribeConfig>(
	(config) => config.clinicalAuditTopicId, 'clinical-scribe'
);

export const CLINICAL_CONSENT_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_record_consent',
		description: 'Records patient consent as an immutable NFT on-ledger. Consent scopes include RECORDING (ambient scribe), DATA_SHARING, TREATMENT, RESEARCH, and BILLING. Tamper-proof consent record that HealthOrbit and other scribe platforms cannot provide.',
		inputSchema: {
			type: 'object',
			properties: {
				patientHash: { type: 'string', description: 'Patient identifier (hashed for privacy)' },
				requesterId: { type: 'string', description: 'Clinician or facility requesting consent' },
				consentScopes: { type: 'array', items: { type: 'string' }, description: 'Consent scopes (RECORDING, DATA_SHARING, TREATMENT, RESEARCH, BILLING)' },
				termsHash: { type: 'string', description: 'Hash of the consent document' },
				consentMethod: { type: 'string', description: 'How consent was obtained (VERBAL, WRITTEN, ELECTRONIC)' },
				expiresAt: { type: 'string', description: 'When consent expires (ISO 8601), if applicable' },
				revocable: { type: 'boolean', description: 'Whether consent can be revoked', default: true }
			},
			required: ['patientHash', 'requesterId', 'consentScopes', 'termsHash', 'consentMethod']
		},
		implementation: async (args, config) => {
			const collectionId = requireConsentCollectionId(config);
			const metadata = JSON.stringify({
				type: 'PATIENT_CONSENT',
				patientHash: args.patientHash,
				requesterId: args.requesterId,
				consentScopes: args.consentScopes,
				termsHash: args.termsHash,
				consentMethod: args.consentMethod,
				grantedAt: new Date().toISOString(),
				expiresAt: args.expiresAt,
				revocable: (args.revocable as boolean) ?? true
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitClinicalAudit(config, {
				event: 'CONSENT_RECORDED',
				patientHash: args.patientHash,
				consentScopes: args.consentScopes,
				consentMethod: args.consentMethod,
				serialNumber,
				mintTxId: mintResult.transactionId
			});
			return {
				success: true, serialNumber,
				transactionId: mintResult.transactionId,
				patientHash: args.patientHash,
				consentScopes: args.consentScopes,
				message: `Patient consent recorded on-ledger. Serial #${serialNumber} — immutable, tamper-proof consent proof.`
			};
		}
	}
];
