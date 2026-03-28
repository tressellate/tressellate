import type { Lesson } from '../types';

export const drugCert: Lesson = {
	id: 'drug-cert',
	slug: 'drug-cert',
	title: 'Healthcare: Drug Lot Certification',
	domain: 'Healthcare',
	primitives: ['Certificate', 'Provenance'],
	toolCount: 5,
	category: 'domain',
	color: 'var(--rose)',
	icon: 'shield',
	description: 'A pharmaceutical company certifies drug lots with GMP compliance, NDC codes, expiration dates, and storage conditions. Cold-chain custody transfers are tracked on the audit trail.',
	steps: [
		{
			id: 'create-collection',
			title: 'Create Drug Certification Collection',
			description: 'One-time setup for the drug certification NFT collection.',
			prompt: 'Create a drug certification NFT collection',
			isSetup: true,
			toolCall: {
				toolName: 'drug_cert_create_collection',
				description: 'Creates the Drug Certification NFT collection.',
				exampleArgs: { tokenName: 'Drug Certifications', tokenSymbol: 'DRUG' },
				mockResponse: { success: true, tokenId: '0.0.9501' }
			},
			note: 'Save as HEDERA_DRUG_CERT_COLLECTION_ID.'
		},
		{
			id: 'create-topic',
			title: 'Create Audit Trail Topic',
			description: 'Create an HCS topic for drug certification audit entries.',
			prompt: 'Create a topic for drug certification audit trail',
			isSetup: true,
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a new HCS topic.',
				exampleArgs: {},
				mockResponse: { success: true, topicId: '0.0.9502' }
			},
			note: 'Save as HEDERA_DRUG_CERT_AUDIT_TOPIC_ID, then restart.'
		},
		{
			id: 'certify-lot-1',
			title: 'Certify a Drug Lot',
			description: 'Mint an NFT with full drug lot metadata including GMP compliance, NDC code, and storage conditions.',
			prompt: 'Certify drug lot LOT-2025-A1: NDC code 12345-678-90, Amoxicillin 500mg capsules, GMP compliant, manufactured 2025-06-01, expires 2027-06-01, storage: 15-25C',
			toolCall: {
				toolName: 'drug_cert_certify_lot',
				description: 'Certifies a drug lot by minting an NFT with GMP/NDC/storage metadata.',
				exampleArgs: { lotId: 'LOT-2025-A1', ndcCode: '12345-678-90', drugName: 'Amoxicillin 500mg', gmpCompliant: true, manufactureDate: '2025-06-01', expirationDate: '2027-06-01', storageConditions: '15-25C' },
				mockResponse: { success: true, serialNumber: 1, transactionId: '0.0.1234@1698769000.000' }
			}
		},
		{
			id: 'certify-lot-2',
			title: 'Certify a Second Lot (Near Expiration)',
			description: 'Certify another lot with a closer expiration date to test expiration detection.',
			prompt: 'Certify lot LOT-2025-B3: NDC 98765-432-10, Insulin Glargine, GMP compliant, manufactured 2025-01-01, expires 2025-07-01, storage: 2-8C refrigerated',
			toolCall: {
				toolName: 'drug_cert_certify_lot',
				description: 'Certifies a drug lot by minting an NFT with GMP/NDC/storage metadata.',
				exampleArgs: { lotId: 'LOT-2025-B3', ndcCode: '98765-432-10', drugName: 'Insulin Glargine', gmpCompliant: true, manufactureDate: '2025-01-01', expirationDate: '2025-07-01', storageConditions: '2-8C refrigerated' },
				mockResponse: { success: true, serialNumber: 2, transactionId: '0.0.1234@1698769100.000' }
			}
		},
		{
			id: 'verify-lot-1',
			title: 'Verify the First Lot',
			description: 'Look up the drug lot certificate and check GMP status and expiration.',
			prompt: 'Verify drug lot certificate serial number 1',
			toolCall: {
				toolName: 'drug_cert_verify_lot',
				description: 'Verifies a drug lot certificate, checking GMP status and expiration.',
				exampleArgs: { serialNumber: 1 },
				mockResponse: { success: true, serialNumber: 1, metadata: { lotId: 'LOT-2025-A1', ndcCode: '12345-678-90', drugName: 'Amoxicillin 500mg', gmpCompliant: true, expirationDate: '2027-06-01', storageConditions: '15-25C' }, expirationStatus: 'VALID' }
			},
			verification: 'Does it show Amoxicillin with valid GMP and non-expired status?'
		},
		{
			id: 'verify-lot-2',
			title: 'Verify the Near-Expiration Lot',
			description: 'Check if the system flags the closer expiration date.',
			prompt: 'Verify drug lot certificate serial number 2',
			toolCall: {
				toolName: 'drug_cert_verify_lot',
				description: 'Verifies a drug lot certificate, checking GMP status and expiration.',
				exampleArgs: { serialNumber: 2 },
				mockResponse: { success: true, serialNumber: 2, metadata: { lotId: 'LOT-2025-B3', ndcCode: '98765-432-10', drugName: 'Insulin Glargine', gmpCompliant: true, expirationDate: '2025-07-01', storageConditions: '2-8C refrigerated' }, expirationStatus: 'EXPIRING_SOON' }
			},
			verification: 'Does the system flag the expiration date proximity?'
		},
		{
			id: 'record-shipment',
			title: 'Record a Cold-Chain Shipment',
			description: 'Log a custody transfer on the audit trail, tracking temperature maintenance.',
			prompt: 'Record a shipment for lot serial 1: shipped from Warehouse W-101 to Distribution Center DC-50, carrier: ColdChain Logistics, temperature maintained at 20C',
			toolCall: {
				toolName: 'drug_cert_record_shipment',
				description: 'Records a custody transfer to the drug certification audit trail.',
				exampleArgs: { serialNumber: 1, fromLocation: 'Warehouse W-101', toLocation: 'Distribution Center DC-50', carrier: 'ColdChain Logistics', temperature: '20C' },
				mockResponse: { success: true, transactionId: '0.0.1234@1698769200.000', event: 'SHIPMENT_RECORDED' }
			}
		},
		{
			id: 'audit-trail',
			title: 'Review Audit Trail',
			description: 'View all drug certification and shipment events.',
			prompt: 'Show the drug certification audit trail',
			toolCall: {
				toolName: 'drug_cert_get_audit',
				description: 'Retrieves all audit trail messages from the drug certification HCS topic.',
				exampleArgs: {},
				mockResponse: {
					success: true,
					messages: [
						{ timestamp: '2025-06-01T10:00:00Z', event: 'LOT_CERTIFIED', lotId: 'LOT-2025-A1', serialNumber: 1 },
						{ timestamp: '2025-06-01T10:05:00Z', event: 'LOT_CERTIFIED', lotId: 'LOT-2025-B3', serialNumber: 2 },
						{ timestamp: '2025-06-15T08:00:00Z', event: 'SHIPMENT_RECORDED', serialNumber: 1, from: 'W-101', to: 'DC-50' }
					],
					total: 3
				}
			},
			verification: 'Do you see certification events AND shipment custody transfers?'
		}
	],
	summary: [
		{ capability: 'Create drug cert collection', toolUsed: 'drug_cert_create_collection' },
		{ capability: 'Certify lot with GMP/NDC', toolUsed: 'drug_cert_certify_lot' },
		{ capability: 'Verify lot + expiration', toolUsed: 'drug_cert_verify_lot' },
		{ capability: 'Record custody transfer', toolUsed: 'drug_cert_record_shipment' },
		{ capability: 'Full drug audit trail', toolUsed: 'drug_cert_get_audit' }
	]
};
