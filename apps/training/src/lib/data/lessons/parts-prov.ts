import type { Lesson } from '../types';

export const partsProv: Lesson = {
	id: 'parts-prov',
	slug: 'parts-prov',
	title: 'Supply Chain: Parts Provenance',
	domain: 'Supply Chain',
	primitives: ['Provenance', 'Certificate'],
	toolCount: 5,
	category: 'domain',
	color: 'var(--amber)',
	icon: 'link',
	description: 'Manufacturing parts are tracked from origin through the supply chain. Each part gets a provenance NFT recording material type, manufacturer, batch, and origin. Quality certifications are recorded to the audit trail.',
	steps: [
		{
			id: 'create-collection',
			title: 'Create Provenance NFT Collection',
			description: 'One-time setup for the provenance tracking collection.',
			prompt: 'Create a parts provenance NFT collection',
			isSetup: true,
			toolCall: {
				toolName: 'parts_prov_create_collection',
				description: 'Creates the Parts Provenance NFT collection.',
				exampleArgs: { tokenName: 'Parts Provenance', tokenSymbol: 'PROV' },
				mockResponse: { success: true, tokenId: '0.0.7001', transactionId: '0.0.1234@1698767000.000' }
			},
			note: 'Save as HEDERA_PARTS_PROV_COLLECTION_ID.'
		},
		{
			id: 'create-topic',
			title: 'Create Audit Trail Topic',
			description: 'Create an HCS topic for provenance audit entries.',
			prompt: 'Create a topic for parts provenance audit trail',
			isSetup: true,
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a new HCS topic.',
				exampleArgs: {},
				mockResponse: { success: true, topicId: '0.0.7002' }
			},
			note: 'Save as HEDERA_PARTS_PROV_AUDIT_TOPIC_ID, then restart.'
		},
		{
			id: 'record-part-1',
			title: 'Record a Part\'s Provenance',
			description: 'Mint an NFT recording the origin and details of a manufactured part.',
			prompt: 'Record provenance for Part P-4821: Titanium alloy bearing, manufactured by Precision Parts Co., batch B-2025-0042, origin: Osaka, Japan',
			toolCall: {
				toolName: 'parts_prov_record',
				description: 'Records a part\'s provenance by minting an NFT with origin metadata.',
				exampleArgs: { partId: 'P-4821', material: 'Titanium alloy bearing', manufacturer: 'Precision Parts Co.', batch: 'B-2025-0042', origin: 'Osaka, Japan' },
				mockResponse: { success: true, serialNumber: 1, transactionId: '0.0.1234@1698767100.000' }
			}
		},
		{
			id: 'record-part-2',
			title: 'Record a Second Part',
			description: 'Record another part with different provenance data.',
			prompt: 'Record provenance for Part P-4822: Carbon fiber panel, manufacturer AeroComposites Ltd., batch CF-2025-117, origin: Toulouse, France',
			toolCall: {
				toolName: 'parts_prov_record',
				description: 'Records a part\'s provenance by minting an NFT with origin metadata.',
				exampleArgs: { partId: 'P-4822', material: 'Carbon fiber panel', manufacturer: 'AeroComposites Ltd.', batch: 'CF-2025-117', origin: 'Toulouse, France' },
				mockResponse: { success: true, serialNumber: 2, transactionId: '0.0.1234@1698767200.000' }
			}
		},
		{
			id: 'verify-part',
			title: 'Verify a Part',
			description: 'Look up the provenance of a part by its serial number.',
			prompt: 'Verify the provenance of part serial number 1',
			toolCall: {
				toolName: 'parts_prov_verify',
				description: 'Verifies a part\'s provenance by reading its NFT metadata.',
				exampleArgs: { serialNumber: 1 },
				mockResponse: { success: true, serialNumber: 1, metadata: { partId: 'P-4821', material: 'Titanium alloy bearing', manufacturer: 'Precision Parts Co.', batch: 'B-2025-0042', origin: 'Osaka, Japan' } }
			},
			verification: 'Does it show the titanium bearing from Osaka?'
		},
		{
			id: 'certify-quality',
			title: 'Certify Quality',
			description: 'Record a quality certification to the audit trail. This is an audit entry, not a new NFT.',
			prompt: 'Record a quality certification for part serial 1: ISO 9001 certified, inspector ID QA-207, passed all tests',
			toolCall: {
				toolName: 'parts_prov_certify_quality',
				description: 'Records a quality certification to the provenance audit trail.',
				exampleArgs: { serialNumber: 1, standard: 'ISO 9001', inspectorId: 'QA-207', result: 'PASSED' },
				mockResponse: { success: true, transactionId: '0.0.1234@1698767300.000', event: 'QUALITY_CERTIFIED' }
			}
		},
		{
			id: 'audit-trail',
			title: 'Check Audit Trail',
			description: 'Review all provenance and quality certification entries.',
			prompt: 'Show the parts provenance audit trail',
			toolCall: {
				toolName: 'parts_prov_get_audit',
				description: 'Retrieves all audit trail messages from the parts provenance HCS topic.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					messages: [
						{ timestamp: '2025-10-15T14:00:00Z', event: 'PROVENANCE_RECORDED', partId: 'P-4821', serialNumber: 1 },
						{ timestamp: '2025-10-15T14:05:00Z', event: 'PROVENANCE_RECORDED', partId: 'P-4822', serialNumber: 2 },
						{ timestamp: '2025-10-15T14:10:00Z', event: 'QUALITY_CERTIFIED', serialNumber: 1, standard: 'ISO 9001' }
					],
					total: 3
				}
			},
			verification: 'Do you see provenance records and quality certification entries?'
		}
	],
	summary: [
		{ capability: 'Create provenance collection', toolUsed: 'parts_prov_create_collection' },
		{ capability: 'Record part provenance', toolUsed: 'parts_prov_record' },
		{ capability: 'Verify part by serial #', toolUsed: 'parts_prov_verify' },
		{ capability: 'Certify quality (audit entry)', toolUsed: 'parts_prov_certify_quality' },
		{ capability: 'Full provenance audit trail', toolUsed: 'parts_prov_get_audit' }
	]
};
