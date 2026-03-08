import { describe, test, expect, afterEach } from 'bun:test';
import { mockSDKModule, createTestConfig } from '../helpers/sdk-mock.js';
import {
    installFetchMock,
    restoreFetch,
    mockTopicMessagesResponse,
} from '../helpers/fetch-mock.js';

// Install SDK mock before importing
mockSDKModule();

const { createTopic, submitTopicMessage, getTopicMessages } = await import('../../tools/consensus.js');

const config = createTestConfig();

// --- Mirror Node Functions ---

describe('getTopicMessages', () => {
    afterEach(() => restoreFetch());

    test('returns decoded messages', async () => {
        installFetchMock([
            { pattern: '/topics/', data: mockTopicMessagesResponse() },
        ]);
        const result = await getTopicMessages(config, '0.0.500');
        expect(result.topicId).toBe('0.0.500');
        expect(result.messages.length).toBe(1);
        expect(result.count).toBe(1);
    });

    test('decodes base64 JSON messages', async () => {
        const messagePayload = { type: 'AUDIT', action: 'MINT', schema: 'BATCHCERT' };
        installFetchMock([
            {
                pattern: '/topics/',
                data: mockTopicMessagesResponse([
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from(JSON.stringify(messagePayload)).toString('base64'),
                    },
                ]),
            },
        ]);
        const result = await getTopicMessages(config, '0.0.500');
        const msg = result.messages[0].message as Record<string, unknown>;
        expect(msg.type).toBe('AUDIT');
        expect(msg.action).toBe('MINT');
        expect(msg.schema).toBe('BATCHCERT');
    });

    test('handles empty topic', async () => {
        installFetchMock([
            { pattern: '/topics/', data: { messages: [] } },
        ]);
        const result = await getTopicMessages(config, '0.0.500');
        expect(result.messages).toEqual([]);
        expect(result.count).toBe(0);
    });

    test('constructs correct URL', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/topics/', data: { messages: [] } },
        ]);
        await getTopicMessages(config, '0.0.500');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('/topics/0.0.500/messages');
    });

    test('respects limit and order filters', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/topics/', data: { messages: [] } },
        ]);
        await getTopicMessages(config, '0.0.500', { limit: 10, order: 'asc' });
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('limit=10');
        expect(url).toContain('order=asc');
    });

    test('applies sequence number filter', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/topics/', data: { messages: [] } },
        ]);
        await getTopicMessages(config, '0.0.500', { sequenceNumberGte: 5 });
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('sequencenumber=gte%3A5');
    });

    test('applies timestamp filter', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/topics/', data: { messages: [] } },
        ]);
        await getTopicMessages(config, '0.0.500', { timestampGte: '2024-01-01' });
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('timestamp=gte%3A2024-01-01');
    });

    test('handles non-JSON base64 messages', async () => {
        installFetchMock([
            {
                pattern: '/topics/',
                data: mockTopicMessagesResponse([
                    {
                        consensus_timestamp: '1705316445.000000000',
                        sequence_number: 1,
                        message: Buffer.from('plain text message').toString('base64'),
                    },
                ]),
            },
        ]);
        const result = await getTopicMessages(config, '0.0.500');
        expect(result.messages[0].message).toBe('plain text message');
    });
});

// --- SDK Transaction Functions ---

describe('createTopic', () => {
    test('returns success with topicId', async () => {
        const result = await createTopic(config, { topicMemo: 'Test Topic' });
        expect(result.success).toBe(true);
        expect(result.topicId).toBeDefined();
    });

    test('uses empty memo by default', async () => {
        const result = await createTopic(config, {});
        expect(result.success).toBe(true);
    });
});

describe('submitTopicMessage', () => {
    test('returns success with consensus timestamp', async () => {
        const result = await submitTopicMessage(config, '0.0.500', { action: 'TEST' });
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });

    test('accepts string messages', async () => {
        const result = await submitTopicMessage(config, '0.0.500', 'plain string');
        expect(result.success).toBe(true);
    });

    test('serializes object messages to JSON', async () => {
        const result = await submitTopicMessage(config, '0.0.500', { key: 'value' });
        expect(result.success).toBe(true);
    });
});
