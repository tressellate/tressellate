import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { mockCoreModule } from '../helpers/core-mock.js';

// The getTopicMessages mock returns messages with snake_case fields
// and base64-encoded message content (matching mirror node API format).
// The query-audit-trail factory calls getTopicMessages and then processes
// the results, re-decoding from base64.

const mocks = mockCoreModule();

const { createQueryAuditTrail } = await import('../../operations/query-audit-trail.js');

describe('createQueryAuditTrail', () => {
    beforeEach(() => {
        mocks.getTopicMessages.mockClear();
    });

    const testConfig = {
        network: 'testnet' as const,
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b657004220420aaaa',
        supplyKey: '302e020100300506032b657004220420bbbb',
    };

    test('returns a function', () => {
        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });
        expect(typeof query).toBe('function');
    });

    test('calls getTopicMessages with correct topicId', async () => {
        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        await query({}, testConfig);

        expect(mocks.getTopicMessages).toHaveBeenCalledTimes(1);
        const [config, topicId] = mocks.getTopicMessages.mock.calls[0];
        expect(config).toBe(testConfig);
        expect(topicId).toBe('0.0.500');
    });

    test('passes limit and order to getTopicMessages', async () => {
        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        await query({ limit: 50, order: 'asc' }, testConfig);

        const [, , filters] = mocks.getTopicMessages.mock.calls[0];
        expect(filters.limit).toBe(50);
        expect(filters.order).toBe('asc');
    });

    test('uses default limit 100 and order desc', async () => {
        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        await query({}, testConfig);

        const [, , filters] = mocks.getTopicMessages.mock.calls[0];
        expect(filters.limit).toBe(100);
        expect(filters.order).toBe('desc');
    });

    test('returns all messages when no schemaType filter', async () => {
        // Mock returns messages with snake_case fields and base64 message content
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({
                messages: [
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from(JSON.stringify({ schema: 'BATCHCERT', action: 'MINT' })).toString('base64'),
                    },
                    {
                        consensus_timestamp: '1705316446.000000000',
                        sequence_number: 2,
                        message: Buffer.from(JSON.stringify({ schema: 'BIOCHARPROV', action: 'RECORD' })).toString('base64'),
                    },
                ],
            })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({}, testConfig);

        expect(result.topicId).toBe('0.0.500');
        expect(result.messages).toHaveLength(2);
        expect(result.count).toBe(2);
    });

    test('filters by schemaType using message.schema field', async () => {
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({
                messages: [
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from(JSON.stringify({ schema: 'BATCHCERT', action: 'MINT' })).toString('base64'),
                    },
                    {
                        consensus_timestamp: '1705316446.000000000',
                        sequence_number: 2,
                        message: Buffer.from(JSON.stringify({ schema: 'BIOCHARPROV', action: 'RECORD' })).toString('base64'),
                    },
                ],
            })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({ schemaType: 'BATCHCERT' }, testConfig);

        expect(result.messages).toHaveLength(1);
        expect(result.count).toBe(1);
        expect(result.messages[0].message.schema).toBe('BATCHCERT');
    });

    test('filters by schemaType using message.type field', async () => {
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({
                messages: [
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from(JSON.stringify({ type: 'AUDIT', schema: 'BATCHCERT' })).toString('base64'),
                    },
                    {
                        consensus_timestamp: '1705316446.000000000',
                        sequence_number: 2,
                        message: Buffer.from(JSON.stringify({ type: 'SOILCARBON' })).toString('base64'),
                    },
                ],
            })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({ schemaType: 'SOILCARBON' }, testConfig);

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].message.type).toBe('SOILCARBON');
    });

    test('handles empty topic messages', async () => {
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({ messages: [] })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({}, testConfig);

        expect(result.messages).toHaveLength(0);
        expect(result.count).toBe(0);
    });

    test('handles non-JSON base64 messages gracefully', async () => {
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({
                messages: [
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from('not-valid-json').toString('base64'),
                    },
                ],
            })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({}, testConfig);

        expect(result.messages).toHaveLength(1);
        // Falls back to { raw: ... }
        expect(result.messages[0].message.raw).toBeDefined();
    });

    test('populates consensusTimestamp and sequenceNumber', async () => {
        mocks.getTopicMessages.mockImplementation(() =>
            Promise.resolve({
                messages: [
                    {
                        consensus_timestamp: '1705316445.123456789',
                        sequence_number: 42,
                        message: Buffer.from(JSON.stringify({ action: 'TEST' })).toString('base64'),
                    },
                ],
            })
        );

        const query = createQueryAuditTrail({
            getTopicId: () => '0.0.500',
        });

        const result = await query({}, testConfig);

        expect(result.messages[0].consensusTimestamp).toBe('1705316445.123456789');
        expect(result.messages[0].sequenceNumber).toBe(42);
    });
});
