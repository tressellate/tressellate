import type { MCPTool } from '@trellis-mcp/core/config';
import { createNFTCollection, mintNFT, transferNFT } from '@trellis-mcp/core';
import { requireConfigField, createAuditSubmitter } from '@trellis-mcp/core/helpers';
import type { LeaseConfig } from '../config.js';

const requireLeaseCollectionId = requireConfigField<LeaseConfig>(
	'leaseCollectionId',
	'Lease collection ID not configured. Set HEDERA_LEASE_COLLECTION_ID or use lease_create_collection first.'
);

const submitLeaseAudit = createAuditSubmitter<LeaseConfig>(
	(config) => config.leaseAuditTopicId,
	'lease'
);

export const LEASE_COLLECTION_TOOLS: MCPTool<LeaseConfig>[] = [
	{
		name: 'lease_create_collection',
		description: `Creates the Lease Agreement NFT collection on Hedera Token Service.
One-time setup. Each minted NFT represents a tokenized lease agreement.
Returns the token ID to store in HEDERA_LEASE_COLLECTION_ID.`,
		inputSchema: {
			type: 'object',
			properties: {
				tokenName: { type: 'string', description: 'Collection name', default: 'Lease Agreements' },
				tokenSymbol: { type: 'string', description: 'Collection symbol', default: 'LEASE' },
				maxSupply: { type: 'number', description: 'Maximum leases (omit for unlimited)' },
				memo: { type: 'string', description: 'Collection description', default: 'Real estate lease agreements - NFT-backed property access' }
			},
			required: []
		},
		implementation: async (args, config) => {
			const result = await createNFTCollection(config, {
				tokenName: (args.tokenName as string) ?? 'Lease Agreements',
				tokenSymbol: (args.tokenSymbol as string) ?? 'LEASE',
				maxSupply: args.maxSupply as number | undefined,
				memo: (args.memo as string) ?? 'Real estate lease agreements - NFT-backed property access'
			});

			await submitLeaseAudit(config, {
				event: 'LEASE_COLLECTION_CREATED',
				tokenId: result.tokenId
			});

			return {
				...result,
				message: `Lease collection created. Store this token ID: ${result.tokenId}`
			};
		}
	},
	{
		name: 'lease_grant',
		description: `Grants a lease by minting an NFT with agreement metadata and transferring it to the tenant.
Three-step: mint → transfer → audit. The NFT metadata contains property, terms, and duration.`,
		inputSchema: {
			type: 'object',
			properties: {
				tenantAccountId: { type: 'string', description: 'Hedera account ID of the tenant' },
				propertyId: { type: 'string', description: 'Property identifier' },
				propertyType: { type: 'string', description: 'Property type (RESIDENTIAL, COMMERCIAL, INDUSTRIAL, LAND, MIXED_USE)' },
				monthlyRent: { type: 'number', description: 'Monthly rent amount' },
				currency: { type: 'string', description: 'Currency code (e.g. USD)', default: 'USD' },
				startDate: { type: 'string', description: 'Lease start date (ISO 8601)' },
				endDate: { type: 'string', description: 'Lease end date (ISO 8601)' },
				termsHash: { type: 'string', description: 'SHA-256 hash of the lease document' }
			},
			required: ['tenantAccountId', 'propertyId', 'propertyType', 'monthlyRent', 'startDate', 'endDate', 'termsHash']
		},
		implementation: async (args, config) => {
			const collectionId = requireLeaseCollectionId(config);

			const metadata = JSON.stringify({
				type: 'LEASE_AGREEMENT',
				propertyId: args.propertyId,
				propertyType: args.propertyType,
				landlordId: config.operatorAccountId,
				tenantId: args.tenantAccountId,
				monthlyRent: args.monthlyRent,
				currency: (args.currency as string) ?? 'USD',
				startDate: args.startDate,
				endDate: args.endDate,
				termsHash: args.termsHash,
				status: 'ACTIVE'
			});

			// Step 1: Mint lease NFT
			const mintResult = await mintNFT(config, collectionId, [metadata]);
			const serialNumber = mintResult.serialNumbers[0];

			// Step 2: Transfer to tenant
			const transferResult = await transferNFT(
				config,
				collectionId,
				config.operatorAccountId,
				args.tenantAccountId as string,
				serialNumber
			);

			// Step 3: Audit
			await submitLeaseAudit(config, {
				event: 'LEASE_GRANTED',
				propertyId: args.propertyId,
				tenantAccountId: args.tenantAccountId,
				serialNumber,
				startDate: args.startDate,
				endDate: args.endDate,
				mintTxId: mintResult.transactionId,
				transferTxId: transferResult.transactionId
			});

			return {
				success: true,
				serialNumber,
				mintTransactionId: mintResult.transactionId,
				transferTransactionId: transferResult.transactionId,
				propertyId: args.propertyId,
				tenantAccountId: args.tenantAccountId,
				startDate: args.startDate,
				endDate: args.endDate
			};
		}
	}
];
