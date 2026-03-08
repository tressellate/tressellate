import { describe, test, expect } from 'bun:test';
import type {
    AssetType,
    AssetReference,
    LedgerMapping,
    AssetOperationResult,
    AuditTrailQuery,
    AuditTrailMessage,
    AuditTrailResult,
} from '../types.js';

describe('AssetType', () => {
    test('all 7 asset types are valid', () => {
        const types: AssetType[] = [
            'Certificate',
            'Provenance',
            'Credit',
            'Agreement',
            'Inspection',
            'Milestone',
            'Claim',
        ];
        expect(types).toHaveLength(7);
        // Each is a string
        types.forEach((t) => expect(typeof t).toBe('string'));
    });

    test('type narrowing works', () => {
        const checkType = (t: AssetType): string => {
            switch (t) {
                case 'Certificate': return 'cert';
                case 'Provenance': return 'prov';
                case 'Credit': return 'cred';
                case 'Agreement': return 'agr';
                case 'Inspection': return 'insp';
                case 'Milestone': return 'mile';
                case 'Claim': return 'clm';
            }
        };
        expect(checkType('Certificate')).toBe('cert');
        expect(checkType('Claim')).toBe('clm');
    });
});

describe('LedgerMapping', () => {
    test('covers NFT and FungibleToken', () => {
        const mappings: LedgerMapping[] = ['NFT', 'FungibleToken'];
        expect(mappings).toHaveLength(2);
    });
});

describe('AssetReference', () => {
    test('satisfies required fields', () => {
        const ref: AssetReference = {
            assetType: 'Certificate',
            tokenId: '0.0.100',
        };
        expect(ref.assetType).toBe('Certificate');
        expect(ref.tokenId).toBe('0.0.100');
    });

    test('includes optional fields', () => {
        const ref: AssetReference = {
            assetType: 'Provenance',
            tokenId: '0.0.200',
            serialNumber: 5,
            label: 'Batch Origin Record',
        };
        expect(ref.serialNumber).toBe(5);
        expect(ref.label).toBe('Batch Origin Record');
    });
});

describe('AssetOperationResult', () => {
    test('satisfies required fields', () => {
        const result: AssetOperationResult = {
            success: true,
            schemaType: 'BATCHCERT',
            assetType: 'Certificate',
            tokenId: '0.0.100',
        };
        expect(result.success).toBe(true);
        expect(result.schemaType).toBe('BATCHCERT');
        expect(result.assetType).toBe('Certificate');
        expect(result.tokenId).toBe('0.0.100');
    });

    test('NFT result includes serialNumber', () => {
        const result: AssetOperationResult = {
            success: true,
            schemaType: 'BATCHCERT',
            assetType: 'Certificate',
            tokenId: '0.0.100',
            serialNumber: 1,
            transactionId: '0.0.123@1705316445.000000000',
            auditTimestamp: '1705316445.000000001',
            metadata: { type: 'BATCHCERT', batch: 'B001' },
        };
        expect(result.serialNumber).toBe(1);
        expect(result.transactionId).toBeDefined();
        expect(result.metadata?.type).toBe('BATCHCERT');
    });

    test('fungible token result includes amount', () => {
        const result: AssetOperationResult = {
            success: true,
            schemaType: 'SOILCARBON',
            assetType: 'Credit',
            tokenId: '0.0.300',
            amount: 500,
            auditTimestamp: null,
        };
        expect(result.amount).toBe(500);
        expect(result.auditTimestamp).toBeNull();
    });
});

describe('AuditTrailQuery', () => {
    test('all fields optional', () => {
        const query: AuditTrailQuery = {};
        expect(query.schemaType).toBeUndefined();
        expect(query.limit).toBeUndefined();
        expect(query.order).toBeUndefined();
    });

    test('accepts filter values', () => {
        const query: AuditTrailQuery = {
            schemaType: 'BATCHCERT',
            limit: 50,
            order: 'asc',
        };
        expect(query.schemaType).toBe('BATCHCERT');
        expect(query.limit).toBe(50);
        expect(query.order).toBe('asc');
    });
});

describe('AuditTrailMessage', () => {
    test('satisfies required fields', () => {
        const msg: AuditTrailMessage = {
            consensusTimestamp: '1705316445.000000000',
            message: { action: 'MINT', schema: 'BATCHCERT' },
            sequenceNumber: 1,
        };
        expect(msg.consensusTimestamp).toBe('1705316445.000000000');
        expect(msg.sequenceNumber).toBe(1);
        expect(msg.message.action).toBe('MINT');
    });
});

describe('AuditTrailResult', () => {
    test('satisfies required fields', () => {
        const result: AuditTrailResult = {
            topicId: '0.0.500',
            messages: [],
            count: 0,
        };
        expect(result.topicId).toBe('0.0.500');
        expect(result.messages).toHaveLength(0);
        expect(result.count).toBe(0);
    });

    test('contains audit trail messages', () => {
        const result: AuditTrailResult = {
            topicId: '0.0.500',
            messages: [
                {
                    consensusTimestamp: '1705316445.000000000',
                    message: { schema: 'BATCHCERT' },
                    sequenceNumber: 1,
                },
            ],
            count: 1,
        };
        expect(result.messages).toHaveLength(1);
        expect(result.count).toBe(1);
    });
});
