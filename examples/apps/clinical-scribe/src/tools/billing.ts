import type { MCPTool } from '@tressellate/core/config';
import { mintNFT } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const requireClaimCollectionId = requireConfigField<ClinicalScribeConfig>(
	'billingClaimCollectionId', 'Billing claim collection ID not configured. Set HEDERA_BILLING_CLAIM_COLLECTION_ID or use clinical_create_claim_collection first.'
);

const submitClinicalAudit = createAuditSubmitter<ClinicalScribeConfig>(
	(config) => config.clinicalAuditTopicId, 'clinical-scribe'
);

export const CLINICAL_BILLING_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_submit_claim',
		description: 'Submits a billing claim as an NFT on-ledger. Extracts CPT/ICD codes from an attested clinical note and creates a transparent, verifiable claim with full audit trail. Unlike traditional billing, every claim is traceable to its source encounter.',
		inputSchema: {
			type: 'object',
			properties: {
				noteRef: { type: 'string', description: 'Clinical note serial number that generated this claim' },
				patientHash: { type: 'string', description: 'Patient identifier (hashed)' },
				clinicianId: { type: 'string', description: 'Rendering provider account ID' },
				cptCodes: { type: 'array', items: { type: 'string' }, description: 'CPT procedure codes for billing' },
				icdCodes: { type: 'array', items: { type: 'string' }, description: 'ICD-10 codes supporting medical necessity' },
				payerId: { type: 'string', description: 'Payer/insurance identifier' },
				amountCents: { type: 'number', description: 'Claim amount in cents' }
			},
			required: ['noteRef', 'patientHash', 'clinicianId', 'cptCodes', 'icdCodes', 'payerId', 'amountCents']
		},
		implementation: async (args, config) => {
			const collectionId = requireClaimCollectionId(config);
			const metadata = JSON.stringify({
				type: 'BILLING_CLAIM',
				noteRef: args.noteRef,
				patientHash: args.patientHash,
				clinicianId: args.clinicianId,
				cptCodes: args.cptCodes,
				icdCodes: args.icdCodes,
				payerId: args.payerId,
				amountCents: args.amountCents,
				status: 'SUBMITTED',
				submittedAt: new Date().toISOString()
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitClinicalAudit(config, {
				event: 'CLAIM_SUBMITTED',
				noteRef: args.noteRef,
				cptCodes: args.cptCodes,
				icdCodes: args.icdCodes,
				payerId: args.payerId,
				amountCents: args.amountCents,
				serialNumber,
				mintTxId: mintResult.transactionId
			});
			return {
				success: true, serialNumber,
				transactionId: mintResult.transactionId,
				noteRef: args.noteRef,
				amountCents: args.amountCents,
				message: `Billing claim submitted on-ledger. Serial #${serialNumber} — transparent, auditable claim lifecycle.`
			};
		}
	},
	{
		name: 'clinical_record_assessment',
		description: 'Records a clinical assessment (vitals, review of systems, physical exam) as an NFT. Structured findings are committed on-ledger with the clinician\'s verification.',
		inputSchema: {
			type: 'object',
			properties: {
				encounterId: { type: 'string', description: 'Reference to the encounter' },
				patientHash: { type: 'string', description: 'Patient identifier (hashed)' },
				clinicianId: { type: 'string', description: 'Assessing clinician account ID' },
				assessmentType: { type: 'string', description: 'Assessment category (VITALS, REVIEW_OF_SYSTEMS, PHYSICAL_EXAM, LAB_REVIEW)' },
				findings: { type: 'object', description: 'Structured findings from the assessment' },
				result: { type: 'string', description: 'Overall result (NORMAL, ABNORMAL, CRITICAL, INCONCLUSIVE)' },
				followUpActions: { type: 'array', items: { type: 'string' }, description: 'Follow-up actions recommended' }
			},
			required: ['encounterId', 'patientHash', 'clinicianId', 'assessmentType', 'findings', 'result']
		},
		implementation: async (args, config) => {
			const collectionId = requireClaimCollectionId(config);
			const metadata = JSON.stringify({
				type: 'CLINICAL_ASSESSMENT',
				encounterId: args.encounterId,
				patientHash: args.patientHash,
				clinicianId: args.clinicianId,
				assessmentType: args.assessmentType,
				findings: args.findings,
				result: args.result,
				followUpActions: args.followUpActions,
				assessedAt: new Date().toISOString()
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitClinicalAudit(config, {
				event: 'ASSESSMENT_RECORDED',
				encounterId: args.encounterId,
				assessmentType: args.assessmentType,
				result: args.result,
				serialNumber,
				mintTxId: mintResult.transactionId
			});
			return {
				success: true, serialNumber,
				transactionId: mintResult.transactionId,
				encounterId: args.encounterId,
				assessmentType: args.assessmentType,
				result: args.result
			};
		}
	}
];
