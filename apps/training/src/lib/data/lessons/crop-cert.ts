import type { Lesson } from '../types';

export const cropCert: Lesson = {
	id: 'crop-cert',
	slug: 'crop-cert',
	title: 'Agriculture: Crop Certificates',
	domain: 'Agriculture',
	primitives: ['Certificate', 'Inspection'],
	toolCount: 5,
	category: 'domain',
	color: 'var(--accent)',
	icon: 'leaf',
	description: 'A farm certifies crop yields as NFTs. Each certificate is immutable on the blockchain — once issued, it cannot be altered. Auditors can verify any certificate by its serial number.',
	steps: [
		{
			id: 'create-collection',
			title: 'Create the NFT Collection',
			description: 'Every certificate domain needs a one-time collection setup. This creates an NFT token class on the Hedera testnet that will hold all crop certificates.',
			prompt: 'Create a crop certificate NFT collection',
			isSetup: true,
			toolCall: {
				toolName: 'crop_cert_create_collection',
				description: 'Creates the Crop Certificate NFT collection on Hedera Token Service.',
				exampleArgs: {
					tokenName: 'Crop Certificates',
					tokenSymbol: 'CROP'
				},
				mockResponse: {
					success: true,
					tokenId: '0.0.5678',
					transactionId: '0.0.1234@1698765432.000',
					message: 'Store this token ID: 0.0.5678'
				}
			},
			note: 'Write down the Token ID — your admin sets it as HEDERA_CROP_CERT_COLLECTION_ID in the config.'
		},
		{
			id: 'create-topic',
			title: 'Create an Audit Trail Topic',
			description: 'An HCS (Hedera Consensus Service) topic acts as an immutable, append-only audit log. Every action in this domain will be recorded here.',
			prompt: 'Create a topic for crop certification audit trail',
			isSetup: true,
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a new Hedera Consensus Service topic for audit trail messages.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					topicId: '0.0.5679',
					transactionId: '0.0.1234@1698765433.000'
				}
			},
			note: 'Write down the Topic ID — set it as HEDERA_CROP_CERT_AUDIT_TOPIC_ID, then restart Claude Desktop.'
		},
		{
			id: 'issue-cert-1',
			title: 'Issue a Crop Certificate',
			description: 'Now issue a real certificate. An NFT is minted with the crop metadata encoded in it, and an audit entry is submitted to the HCS topic.',
			prompt: 'Issue a crop yield certificate for Farm F-201, Field A3. The crop is 2,500 kg of Jasmine Rice, harvested on 2025-10-15, certified under USDA Organic standards.',
			toolCall: {
				toolName: 'crop_cert_issue',
				description: 'Issues a crop yield certificate by minting an NFT with harvest metadata.',
				exampleArgs: {
					farmId: 'F-201',
					fieldId: 'A3',
					crop: 'Jasmine Rice',
					yieldKg: 2500,
					harvestDate: '2025-10-15',
					standard: 'USDA_ORGANIC'
				},
				mockResponse: {
					success: true,
					serialNumber: 1,
					transactionId: '0.0.1234@1698765500.000',
					collectionId: '0.0.5678'
				}
			}
		},
		{
			id: 'issue-cert-2',
			title: 'Issue a Second Certificate',
			description: 'Issue another certificate with different data to see the serial number increment.',
			prompt: 'Issue another certificate: Farm F-305, Field B1, 800 kg of Cherry Tomatoes, harvested 2025-11-01, GAP certified.',
			toolCall: {
				toolName: 'crop_cert_issue',
				description: 'Issues a crop yield certificate by minting an NFT with harvest metadata.',
				exampleArgs: {
					farmId: 'F-305',
					fieldId: 'B1',
					crop: 'Cherry Tomatoes',
					yieldKg: 800,
					harvestDate: '2025-11-01',
					standard: 'GAP'
				},
				mockResponse: {
					success: true,
					serialNumber: 2,
					transactionId: '0.0.1234@1698765600.000',
					collectionId: '0.0.5678'
				}
			},
			verification: 'The serial number should be 2 (incremented from the first certificate).'
		},
		{
			id: 'verify-cert',
			title: 'Verify a Certificate',
			description: 'Now query the blockchain to verify the first certificate. The returned data should match exactly what you issued in step 3.',
			prompt: 'Verify crop certificate serial number 1',
			toolCall: {
				toolName: 'crop_cert_verify',
				description: 'Verifies a crop certificate by looking up the NFT metadata from the mirror node.',
				exampleArgs: {
					serialNumber: 1
				},
				mockResponse: {
					success: true,
					serialNumber: 1,
					metadata: {
						type: 'CROP_CERT',
						farmId: 'F-201',
						fieldId: 'A3',
						crop: 'Jasmine Rice',
						yieldKg: 2500,
						harvestDate: '2025-10-15',
						standard: 'USDA_ORGANIC',
						certifiedAt: '2025-10-15T14:30:00.000Z'
					},
					owner: '0.0.1234'
				}
			},
			verification: 'Does the returned data match what you issued? Check: farm, crop, weight, date, standard.'
		},
		{
			id: 'list-certs',
			title: 'List Certificates by Farm',
			description: 'Query all certificates held by your account. Both certificates you issued should appear.',
			prompt: 'List all crop certificates for my account',
			toolCall: {
				toolName: 'crop_cert_list_by_farm',
				description: 'Lists all crop certificate NFTs held by the specified account.',
				exampleArgs: {
					accountId: '0.0.1234'
				},
				mockResponse: {
					success: true,
					certificates: [
						{ serialNumber: 1, crop: 'Jasmine Rice', farmId: 'F-201', yieldKg: 2500 },
						{ serialNumber: 2, crop: 'Cherry Tomatoes', farmId: 'F-305', yieldKg: 800 }
					],
					total: 2
				}
			},
			verification: 'You should see both certificates listed with correct metadata.'
		},
		{
			id: 'audit-trail',
			title: 'Query the Audit Trail',
			description: 'Read all messages from the HCS topic. Every operation you performed should appear as a timestamped, immutable entry.',
			prompt: 'Show me the crop certification audit trail',
			toolCall: {
				toolName: 'crop_cert_get_audit',
				description: 'Retrieves all audit trail messages from the crop certification HCS topic.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					messages: [
						{
							timestamp: '2025-10-15T14:25:00.000Z',
							event: 'COLLECTION_CREATED',
							tokenId: '0.0.5678'
						},
						{
							timestamp: '2025-10-15T14:30:00.000Z',
							event: 'CROP_CERT_ISSUED',
							farmId: 'F-201',
							crop: 'Jasmine Rice',
							serialNumber: 1
						},
						{
							timestamp: '2025-10-15T14:35:00.000Z',
							event: 'CROP_CERT_ISSUED',
							farmId: 'F-305',
							crop: 'Cherry Tomatoes',
							serialNumber: 2
						}
					],
					total: 3
				}
			},
			verification: 'Do you see entries for: collection creation, first certificate, and second certificate?'
		}
	],
	summary: [
		{ capability: 'Create NFT collection', toolUsed: 'crop_cert_create_collection' },
		{ capability: 'Issue certificate with metadata', toolUsed: 'crop_cert_issue' },
		{ capability: 'Verify certificate by serial #', toolUsed: 'crop_cert_verify' },
		{ capability: 'List certificates by account', toolUsed: 'crop_cert_list_by_farm' },
		{ capability: 'Immutable audit trail', toolUsed: 'crop_cert_get_audit' }
	]
};
