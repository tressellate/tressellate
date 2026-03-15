import type { MCPTool } from '@tressellate/core/config';
import { getAccountNFTs, getNFTInfo } from '@tressellate/core/tools/nft';
import { submitTopicMessage } from '@tressellate/core/tools/consensus';
import { requireConfigField } from '@tressellate/core/helpers';
import type { LeaseConfig } from '../config.js';

const requireLeaseCollectionId = requireConfigField<LeaseConfig>(
	'leaseCollectionId',
	'Lease collection ID not configured. Set HEDERA_LEASE_COLLECTION_ID.'
);

const requireLeaseAuditTopicId = requireConfigField<LeaseConfig>(
	'leaseAuditTopicId',
	'Lease audit topic ID not configured. Set HEDERA_LEASE_AUDIT_TOPIC_ID.'
);

export const LEASE_QUERY_TOOLS: MCPTool<LeaseConfig>[] = [
	{
		name: 'lease_verify_tenant',
		description: `Verifies if an account holds a valid lease for a specific property.
Checks all lease NFTs held by the account and matches by property ID and date validity.`,
		inputSchema: {
			type: 'object',
			properties: {
				accountId: { type: 'string', description: 'Hedera account ID to verify' },
				propertyId: { type: 'string', description: 'Property ID to check lease for' }
			},
			required: ['accountId', 'propertyId']
		},
		implementation: async (args, config: LeaseConfig) => {
			const collectionId = requireLeaseCollectionId(config);
			const nftsResult = await getAccountNFTs(config, args.accountId as string, collectionId);

			if (!nftsResult.nfts || nftsResult.nfts.length === 0) {
				return { accountId: args.accountId, propertyId: args.propertyId, hasLease: false, reason: 'No lease NFTs held' };
			}

			const now = new Date();
			for (const nft of nftsResult.nfts) {
				if (!nft.metadata) continue;
				try {
					const meta = JSON.parse(nft.metadata);
					if (meta.type !== 'LEASE_AGREEMENT' || meta.propertyId !== args.propertyId) continue;

					const endDate = new Date(meta.endDate);
					if (endDate < now) {
						return { accountId: args.accountId, propertyId: args.propertyId, hasLease: false, reason: 'Lease expired', serialNumber: nft.serialNumber, endDate: meta.endDate };
					}

					return { accountId: args.accountId, propertyId: args.propertyId, hasLease: true, serialNumber: nft.serialNumber, startDate: meta.startDate, endDate: meta.endDate, monthlyRent: meta.monthlyRent };
				} catch { continue; }
			}

			return { accountId: args.accountId, propertyId: args.propertyId, hasLease: false, reason: 'No matching lease found' };
		}
	},
	{
		name: 'lease_record_payment',
		description: `Records a lease payment milestone to the audit trail.
Creates an immutable record of rent payment for a specific lease period.`,
		inputSchema: {
			type: 'object',
			properties: {
				leaseSerialNumber: { type: 'number', description: 'Lease NFT serial number' },
				period: { type: 'string', description: 'Payment period (e.g. "2024-03")' },
				amountPaid: { type: 'number', description: 'Amount paid' },
				currency: { type: 'string', description: 'Currency code', default: 'USD' }
			},
			required: ['leaseSerialNumber', 'period', 'amountPaid']
		},
		implementation: async (args, config: LeaseConfig) => {
			const topicId = requireLeaseAuditTopicId(config);
			return submitTopicMessage(config, topicId, {
				event: 'LEASE_PAYMENT_RECORDED',
				type: 'PAYMENT_MILESTONE',
				leaseRef: `serial:${args.leaseSerialNumber}`,
				period: args.period,
				amountPaid: args.amountPaid,
				currency: (args.currency as string) ?? 'USD',
				paidAt: new Date().toISOString(),
				status: 'PAID',
				domain: 'lease'
			});
		}
	}
];
