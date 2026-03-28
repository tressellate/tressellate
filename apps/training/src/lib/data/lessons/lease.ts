import type { Lesson } from '../types';

export const lease: Lesson = {
	id: 'lease',
	slug: 'lease',
	title: 'Real Estate: Lease Agreements',
	domain: 'Real Estate',
	primitives: ['Agreement', 'Milestone'],
	toolCount: 5,
	category: 'domain',
	color: 'var(--blue)',
	icon: 'building',
	description: 'A property manager mints lease agreements as NFTs and transfers them to tenants. Rent payments are recorded as milestones on the audit trail. Tenancy can be verified by checking who holds the NFT.',
	steps: [
		{
			id: 'create-collection',
			title: 'Create the Lease NFT Collection',
			description: 'One-time setup of the NFT collection that will hold all lease agreements.',
			prompt: 'Create a lease agreement NFT collection',
			isSetup: true,
			toolCall: {
				toolName: 'lease_create_collection',
				description: 'Creates the Lease Agreement NFT collection on Hedera Token Service.',
				exampleArgs: { tokenName: 'Lease Agreements', tokenSymbol: 'LEASE' },
				mockResponse: { success: true, tokenId: '0.0.6001', transactionId: '0.0.1234@1698766000.000' }
			},
			note: 'Save the Token ID as HEDERA_LEASE_COLLECTION_ID.'
		},
		{
			id: 'create-topic',
			title: 'Create Audit Trail Topic',
			description: 'Create an HCS topic for lease audit entries.',
			prompt: 'Create a topic for lease audit trail',
			isSetup: true,
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a new HCS topic for the lease audit trail.',
				exampleArgs: {},
				mockResponse: { success: true, topicId: '0.0.6002', transactionId: '0.0.1234@1698766001.000' }
			},
			note: 'Save as HEDERA_LEASE_AUDIT_TOPIC_ID, then restart Claude Desktop.'
		},
		{
			id: 'create-tenant',
			title: 'Create a Tenant Account',
			description: 'Before granting a lease, you need a tenant account to transfer the NFT to.',
			prompt: 'Create a new Hedera account for a tenant',
			toolCall: {
				toolName: 'hedera_create_account',
				description: 'Creates a new Hiero account with an ED25519 key pair.',
				exampleArgs: {},
				mockResponse: { success: true, accountId: '0.0.9001', publicKey: '302a300506032b6570...', privateKey: '302e020100300506032b6570...' }
			},
			note: 'Write down the tenant Account ID (e.g., 0.0.9001).'
		},
		{
			id: 'grant-lease',
			title: 'Grant a Lease to Tenant',
			description: 'This is a 3-step operation: mint the lease NFT, transfer it to the tenant, and log the audit entry. The tenant now "holds" their lease on-chain.',
			prompt: 'Grant a lease to tenant 0.0.9001 for Unit 4B at 123 Main St, starting 2025-01-01, ending 2026-01-01, monthly rent $2,500',
			toolCall: {
				toolName: 'lease_grant',
				description: 'Mints a lease agreement NFT and transfers it to the tenant account.',
				exampleArgs: { tenantAccountId: '0.0.9001', unit: '4B', address: '123 Main St', startDate: '2025-01-01', endDate: '2026-01-01', monthlyRent: 2500 },
				mockResponse: { success: true, serialNumber: 1, tenantAccountId: '0.0.9001', transactionId: '0.0.1234@1698766100.000' }
			}
		},
		{
			id: 'verify-tenant',
			title: 'Verify Tenancy',
			description: 'Check if the tenant account holds a valid lease NFT. This is how ownership is verified on-chain.',
			prompt: 'Verify that account 0.0.9001 holds a valid lease',
			toolCall: {
				toolName: 'lease_verify_tenant',
				description: 'Verifies that an account holds a valid lease NFT and returns lease details.',
				exampleArgs: { tenantAccountId: '0.0.9001' },
				mockResponse: { success: true, hasLease: true, lease: { unit: '4B', address: '123 Main St', startDate: '2025-01-01', endDate: '2026-01-01', monthlyRent: 2500 }, serialNumber: 1 }
			},
			verification: 'Does the lease metadata match what you granted?'
		},
		{
			id: 'record-payment',
			title: 'Record a Rent Payment',
			description: 'Log a rent payment as a milestone on the audit trail. This creates an immutable record of the payment.',
			prompt: 'Record a rent payment of $2,500 from tenant 0.0.9001 for January 2025',
			toolCall: {
				toolName: 'lease_record_payment',
				description: 'Records a rent payment milestone to the lease audit trail.',
				exampleArgs: { tenantAccountId: '0.0.9001', amount: 2500, period: 'January 2025' },
				mockResponse: { success: true, transactionId: '0.0.1234@1698766200.000', event: 'RENT_PAYMENT_RECORDED' }
			}
		},
		{
			id: 'audit-trail',
			title: 'Query Audit Trail',
			description: 'Review all lease operations recorded on the HCS topic.',
			prompt: 'Show the lease audit trail',
			toolCall: {
				toolName: 'lease_get_audit',
				description: 'Retrieves all audit trail messages from the lease HCS topic.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					messages: [
						{ timestamp: '2025-01-01T10:00:00Z', event: 'LEASE_GRANTED', tenant: '0.0.9001', unit: '4B', serialNumber: 1 },
						{ timestamp: '2025-02-01T09:00:00Z', event: 'RENT_PAYMENT_RECORDED', tenant: '0.0.9001', amount: 2500, period: 'January 2025' }
					],
					total: 2
				}
			},
			verification: 'Do you see entries for lease creation, tenant transfer, and rent payment?'
		}
	],
	summary: [
		{ capability: 'Create lease collection', toolUsed: 'lease_create_collection' },
		{ capability: 'Grant lease (mint + transfer)', toolUsed: 'lease_grant' },
		{ capability: 'Verify tenant holds lease', toolUsed: 'lease_verify_tenant' },
		{ capability: 'Record rent payment milestone', toolUsed: 'lease_record_payment' },
		{ capability: 'Audit trail shows full history', toolUsed: 'lease_get_audit' }
	]
};
