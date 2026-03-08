import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { mockCoreModule, defaultNFTInfoResult } from '../helpers/core-mock.js';

const mocks = mockCoreModule();

const { createQueryRecord } = await import('../../operations/query-record.js');

describe('createQueryRecord', () => {
    beforeEach(() => {
        mocks.getNFTInfo.mockClear();
    });

    const testConfig = {
        network: 'testnet' as const,
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b657004220420aaaa',
        supplyKey: '302e020100300506032b657004220420bbbb',
    };

    test('returns a function', () => {
        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT', 'BIOCHARPROV'],
        });
        expect(typeof query).toBe('function');
    });

    test('throws for unsupported schema type', async () => {
        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT', 'BIOCHARPROV'],
        });

        expect(query('UNKNOWN_SCHEMA', 1, testConfig)).rejects.toThrow(
            'Unknown schema type: UNKNOWN_SCHEMA'
        );
    });

    test('error message lists supported schemas', async () => {
        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT', 'BIOCHARPROV'],
        });

        expect(query('BAD', 1, testConfig)).rejects.toThrow(
            'Supported: BATCHCERT, BIOCHARPROV'
        );
    });

    test('calls getNFTInfo with correct arguments', async () => {
        const query = createQueryRecord({
            getCollectionId: (config, schemaType) => {
                if (schemaType === 'BATCHCERT') return '0.0.100';
                return '0.0.200';
            },
            supportedSchemas: ['BATCHCERT', 'BIOCHARPROV'],
        });

        await query('BATCHCERT', 5, testConfig);

        expect(mocks.getNFTInfo).toHaveBeenCalledTimes(1);
        const [config, collectionId, serialNumber] = mocks.getNFTInfo.mock.calls[0];
        expect(config).toBe(testConfig);
        expect(collectionId).toBe('0.0.100');
        expect(serialNumber).toBe(5);
    });

    test('parses JSON metadata from NFT info', async () => {
        mocks.getNFTInfo.mockImplementation(() =>
            Promise.resolve({
                ...defaultNFTInfoResult,
                metadata: JSON.stringify({ type: 'BATCHCERT', batch: 'B001', quantity: 100 }),
            })
        );

        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT'],
        });

        const result = await query('BATCHCERT', 1, testConfig);

        expect(result.schemaType).toBe('BATCHCERT');
        expect(result.collectionId).toBe('0.0.100');
        expect(result.serialNumber).toBe(1);
        expect(result.metadata.type).toBe('BATCHCERT');
        expect(result.metadata.batch).toBe('B001');
        expect(result.metadata.quantity).toBe(100);
    });

    test('handles invalid JSON metadata gracefully', async () => {
        mocks.getNFTInfo.mockImplementation(() =>
            Promise.resolve({
                ...defaultNFTInfoResult,
                metadata: 'not-valid-json',
            })
        );

        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT'],
        });

        const result = await query('BATCHCERT', 1, testConfig);

        expect(result.metadata.raw).toBe('not-valid-json');
    });

    test('handles null/undefined metadata', async () => {
        mocks.getNFTInfo.mockImplementation(() =>
            Promise.resolve({
                ...defaultNFTInfoResult,
                metadata: null,
            })
        );

        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT'],
        });

        const result = await query('BATCHCERT', 1, testConfig);

        expect(result.metadata).toEqual({});
    });

    test('includes NFT info fields in result', async () => {
        mocks.getNFTInfo.mockImplementation(() =>
            Promise.resolve({
                ...defaultNFTInfoResult,
                accountId: '0.0.200',
                createdTimestamp: '1705316445.000000000',
                modifiedTimestamp: '1705316446.000000000',
                deleted: false,
            })
        );

        const query = createQueryRecord({
            getCollectionId: () => '0.0.100',
            supportedSchemas: ['BATCHCERT'],
        });

        const result = await query('BATCHCERT', 1, testConfig);

        expect(result.accountId).toBe('0.0.200');
        expect(result.createdTimestamp).toBe('1705316445.000000000');
        expect(result.modifiedTimestamp).toBe('1705316446.000000000');
        expect(result.deleted).toBe(false);
    });

    test('maps different schema types to different collection IDs', async () => {
        const query = createQueryRecord({
            getCollectionId: (_config, schemaType) => {
                const map: Record<string, string> = {
                    BATCHCERT: '0.0.100',
                    BIOCHARPROV: '0.0.200',
                };
                return map[schemaType] || '0.0.999';
            },
            supportedSchemas: ['BATCHCERT', 'BIOCHARPROV'],
        });

        await query('BIOCHARPROV', 3, testConfig);

        const [, collectionId] = mocks.getNFTInfo.mock.calls[0];
        expect(collectionId).toBe('0.0.200');
    });
});
