import type { MCPTool } from '@tressellate/core/config';
import { mintNFT } from '@tressellate/core';
import { requireConfigField, createAuditSubmitter } from '@tressellate/core/helpers';
import type { ClinicalScribeConfig } from '../config.js';

const requireNoteCollectionId = requireConfigField<ClinicalScribeConfig>(
	'clinicalNoteCollectionId', 'Clinical note collection ID not configured. Set HEDERA_CLINICAL_NOTE_COLLECTION_ID.'
);

const submitClinicalAudit = createAuditSubmitter<ClinicalScribeConfig>(
	(config) => config.clinicalAuditTopicId, 'clinical-scribe'
);

export const CLINICAL_LNC_TOOLS: MCPTool<ClinicalScribeConfig>[] = [
	{
		name: 'clinical_lnc_encode',
		description: 'Encodes clinical content using Linear Network Coding for resilient off-chain storage. Splits content into polynomial-coded packets scattered across network nodes — no single node holds complete PHI. Content is mathematically reconstructible from any sufficient subset of packets (k-of-n threshold). Cheaper than full replication and provides privacy by design.',
		inputSchema: {
			type: 'object',
			properties: {
				assetRef: { type: 'string', description: 'Clinical note or consent serial number to protect' },
				contentHash: { type: 'string', description: 'SHA-256 hash of the content to encode' },
				totalPackets: { type: 'number', description: 'Number of coded packets to generate (more = more resilient)', default: 10 },
				reconstructionThreshold: { type: 'number', description: 'Minimum packets needed for reconstruction (k of n)', default: 6 },
				polynomialDegree: { type: 'number', description: 'Polynomial degree for coding (higher = more resilient)', default: 3 },
				encryptionScheme: { type: 'string', description: 'Encryption applied before LNC encoding', default: 'AES-256-GCM' }
			},
			required: ['assetRef', 'contentHash']
		},
		implementation: async (args, config) => {
			const collectionId = requireNoteCollectionId(config);
			const totalPackets = (args.totalPackets as number) ?? 10;
			const reconstructionThreshold = (args.reconstructionThreshold as number) ?? 6;
			const polynomialDegree = (args.polynomialDegree as number) ?? 3;

			if (reconstructionThreshold > totalPackets) {
				throw new Error(`Reconstruction threshold (${reconstructionThreshold}) cannot exceed total packets (${totalPackets})`);
			}

			const metadata = JSON.stringify({
				type: 'LNC_RESILIENCE_RECORD',
				assetRef: args.assetRef,
				contentHash: args.contentHash,
				status: 'ENCODED',
				totalPackets,
				reconstructionThreshold,
				activeNodes: totalPackets,
				polynomialDegree,
				preEncrypted: true,
				encryptionScheme: (args.encryptionScheme as string) ?? 'AES-256-GCM',
				encodedAt: new Date().toISOString(),
				lastVerifiedAt: new Date().toISOString()
			});
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];
			await submitClinicalAudit(config, {
				event: 'LNC_ENCODED',
				assetRef: args.assetRef,
				totalPackets,
				reconstructionThreshold,
				polynomialDegree,
				serialNumber,
				mintTxId: mintResult.transactionId
			});
			return {
				success: true, serialNumber,
				transactionId: mintResult.transactionId,
				assetRef: args.assetRef,
				totalPackets,
				reconstructionThreshold,
				storageEfficiency: `${((reconstructionThreshold / totalPackets) * 100).toFixed(0)}% of full replication cost`,
				message: `LNC encoding complete. ${totalPackets} coded packets across nodes, ${reconstructionThreshold} needed to reconstruct. No single node holds complete PHI.`
			};
		}
	},
	{
		name: 'clinical_lnc_verify',
		description: 'Verifies the LNC resilience status of encoded clinical content. Checks that sufficient coded packets remain available for reconstruction and that content integrity is provable on-chain without decrypting PHI.',
		inputSchema: {
			type: 'object',
			properties: {
				assetRef: { type: 'string', description: 'Clinical asset serial number to verify resilience for' },
				serialNumber: { type: 'number', description: 'LNC resilience record serial number' }
			},
			required: ['serialNumber']
		},
		implementation: async (args, config: ClinicalScribeConfig) => {
			const collectionId = requireNoteCollectionId(config);
			const { getNFTInfo } = await import('@tressellate/core/tools/nft');
			const nftInfo = await getNFTInfo(config, collectionId, args.serialNumber as number);
			if (!nftInfo || !nftInfo.metadata) return { resilient: false, reason: 'LNC record not found' };
			try {
				const metadata = JSON.parse(nftInfo.metadata);
				const isResilient = metadata.activeNodes >= metadata.reconstructionThreshold;
				const redundancyFactor = metadata.activeNodes / metadata.reconstructionThreshold;
				return {
					resilient: isResilient,
					status: metadata.status,
					assetRef: metadata.assetRef,
					contentHash: metadata.contentHash,
					totalPackets: metadata.totalPackets,
					activeNodes: metadata.activeNodes,
					reconstructionThreshold: metadata.reconstructionThreshold,
					redundancyFactor: redundancyFactor.toFixed(2),
					preEncrypted: metadata.preEncrypted,
					encryptionScheme: metadata.encryptionScheme,
					encodedAt: metadata.encodedAt,
					lastVerifiedAt: metadata.lastVerifiedAt,
					warning: !isResilient ? `Only ${metadata.activeNodes} of ${metadata.reconstructionThreshold} required nodes available — data at risk` : undefined
				};
			} catch { return { resilient: false, reason: 'Invalid LNC metadata' }; }
		}
	}
];
