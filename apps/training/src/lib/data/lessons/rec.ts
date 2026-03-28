import type { Lesson } from '../types';

export const rec: Lesson = {
	id: 'rec',
	slug: 'rec',
	title: 'Energy: Renewable Energy Credits',
	domain: 'Energy',
	primitives: ['Credit', 'Certificate'],
	toolCount: 6,
	category: 'domain',
	color: 'var(--cyan)',
	icon: 'zap',
	description: 'RECs are issued as fungible tokens (1 token = 1 MWh). Generation certificates are minted as NFTs linking to the facility, energy source, and verification body. This is the only domain that uses both fungible tokens and NFTs.',
	steps: [
		{
			id: 'create-token',
			title: 'Create the REC Fungible Token',
			description: 'Unlike other domains that only use NFTs, RECs use a fungible token where 1 token = 1 MWh of renewable energy.',
			prompt: 'Create a Renewable Energy Credit token',
			isSetup: true,
			toolCall: {
				toolName: 'rec_create_token',
				description: 'Creates the REC fungible token on Hedera Token Service.',
				exampleArgs: { tokenName: 'Renewable Energy Credits', tokenSymbol: 'REC', decimals: 0 },
				mockResponse: { success: true, tokenId: '0.0.8001', transactionId: '0.0.1234@1698768000.000' }
			},
			note: 'Save as HEDERA_REC_TOKEN_ID. This is a fungible token, not an NFT.'
		},
		{
			id: 'create-cert-collection',
			title: 'Create Generation Certificate Collection',
			description: 'NFT collection for generation certificates that prove where/how energy was generated.',
			prompt: 'Create a generation certificate NFT collection',
			isSetup: true,
			toolCall: {
				toolName: 'rec_create_cert_collection',
				description: 'Creates the Generation Certificate NFT collection.',
				exampleArgs: { tokenName: 'Generation Certificates', tokenSymbol: 'GENCERT' },
				mockResponse: { success: true, tokenId: '0.0.8002' }
			},
			note: 'Save as HEDERA_REC_CERT_COLLECTION_ID.'
		},
		{
			id: 'create-topic',
			title: 'Create Audit Trail Topic',
			description: 'Create an HCS topic for energy audit entries.',
			prompt: 'Create a topic for energy audit trail',
			isSetup: true,
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a new HCS topic.',
				exampleArgs: {},
				mockResponse: { success: true, topicId: '0.0.8003' }
			},
			note: 'Save as HEDERA_REC_AUDIT_TOPIC_ID, then restart.'
		},
		{
			id: 'mint-credits',
			title: 'Mint Energy Credits',
			description: 'Mint fungible tokens representing MWh of renewable energy generated.',
			prompt: 'Mint 500 renewable energy credits representing 500 MWh generated at Solar Farm SF-101',
			toolCall: {
				toolName: 'rec_mint_credits',
				description: 'Mints REC fungible tokens (1 token = 1 MWh).',
				exampleArgs: { amount: 500, facilityId: 'SF-101' },
				mockResponse: { success: true, amount: 500, tokenId: '0.0.8001', transactionId: '0.0.1234@1698768100.000' }
			}
		},
		{
			id: 'issue-gen-cert',
			title: 'Issue a Generation Certificate',
			description: 'Mint an NFT that proves the origin of the energy — linking facility, source type, period, and verifier.',
			prompt: 'Issue a generation certificate for Solar Farm SF-101: 500 MWh of solar energy, generated in Q3 2025, verified by Green-e',
			toolCall: {
				toolName: 'rec_issue_generation_cert',
				description: 'Issues a generation certificate NFT with facility and verification metadata.',
				exampleArgs: { facilityId: 'SF-101', energySource: 'Solar', amountMWh: 500, period: 'Q3 2025', verifier: 'Green-e' },
				mockResponse: { success: true, serialNumber: 1, transactionId: '0.0.1234@1698768200.000' }
			}
		},
		{
			id: 'check-balance',
			title: 'Check REC Balance',
			description: 'Query your fungible token balance to confirm the minted credits.',
			prompt: 'What is the REC token balance for my account?',
			toolCall: {
				toolName: 'rec_get_balance',
				description: 'Queries the REC token balance for a specified account.',
				exampleArgs: { accountId: '0.0.1234' },
				mockResponse: { success: true, balance: 500, tokenId: '0.0.8001', tokenSymbol: 'REC' }
			},
			verification: 'Balance should be 500 tokens.'
		},
		{
			id: 'mint-more',
			title: 'Mint More Credits (Different Source)',
			description: 'Mint additional RECs from a different facility and verify the balance increases.',
			prompt: 'Mint 200 RECs from Wind Farm WF-302',
			toolCall: {
				toolName: 'rec_mint_credits',
				description: 'Mints REC fungible tokens (1 token = 1 MWh).',
				exampleArgs: { amount: 200, facilityId: 'WF-302' },
				mockResponse: { success: true, amount: 200, tokenId: '0.0.8001', transactionId: '0.0.1234@1698768300.000' }
			},
			note: 'After minting, check your balance again — it should be 700.'
		},
		{
			id: 'audit-trail',
			title: 'Review Audit Trail',
			description: 'View all energy operations — both fungible minting and NFT certificate issuance.',
			prompt: 'Show the energy audit trail',
			toolCall: {
				toolName: 'rec_get_audit',
				description: 'Retrieves all audit trail messages from the energy HCS topic.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					messages: [
						{ timestamp: '2025-10-15T14:00:00Z', event: 'CREDITS_MINTED', amount: 500, facility: 'SF-101' },
						{ timestamp: '2025-10-15T14:05:00Z', event: 'GENERATION_CERT_ISSUED', facility: 'SF-101', serialNumber: 1 },
						{ timestamp: '2025-10-15T14:10:00Z', event: 'CREDITS_MINTED', amount: 200, facility: 'WF-302' }
					],
					total: 3
				}
			},
			verification: 'Do you see separate entries for each minting event and the generation certificate?'
		}
	],
	summary: [
		{ capability: 'Create fungible REC token', toolUsed: 'rec_create_token' },
		{ capability: 'Create cert NFT collection', toolUsed: 'rec_create_cert_collection' },
		{ capability: 'Mint fungible credits', toolUsed: 'rec_mint_credits' },
		{ capability: 'Issue generation cert NFT', toolUsed: 'rec_issue_generation_cert' },
		{ capability: 'Query token balance', toolUsed: 'rec_get_balance' },
		{ capability: 'Audit trail (both types)', toolUsed: 'rec_get_audit' }
	]
};
