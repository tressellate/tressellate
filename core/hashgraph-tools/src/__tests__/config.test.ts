import { describe, test, expect } from 'bun:test';
import { mockSDKModule, createTestConfig } from './helpers/sdk-mock.js';

// Install SDK mock before importing
const sdkMocks = mockSDKModule();

const { buildClient, MIRROR_NODE_URLS } = await import('../config.js');

describe('buildClient', () => {
    test('creates a client for testnet', () => {
        const config = createTestConfig({ network: 'testnet' });
        const client = buildClient(config);
        expect(client).toBeDefined();
    });

    test('creates a client for mainnet', () => {
        const config = createTestConfig({ network: 'mainnet' });
        const client = buildClient(config);
        expect(client).toBeDefined();
    });

    test('creates a client for previewnet', () => {
        const config = createTestConfig({ network: 'previewnet' });
        const client = buildClient(config);
        expect(client).toBeDefined();
    });

    test('sets operator with accountId and privateKey', () => {
        const config = createTestConfig();
        const client = buildClient(config);
        expect(client.setOperator).toHaveBeenCalled();
    });
});

describe('MIRROR_NODE_URLS', () => {
    test('has testnet entry', () => {
        expect(MIRROR_NODE_URLS.testnet).toBeDefined();
        expect(typeof MIRROR_NODE_URLS.testnet).toBe('string');
    });

    test('has mainnet entry', () => {
        expect(MIRROR_NODE_URLS.mainnet).toBeDefined();
        expect(typeof MIRROR_NODE_URLS.mainnet).toBe('string');
    });

    test('has previewnet entry', () => {
        expect(MIRROR_NODE_URLS.previewnet).toBeDefined();
        expect(typeof MIRROR_NODE_URLS.previewnet).toBe('string');
    });

    test('URLs are valid HTTP(S) URLs', () => {
        for (const [, url] of Object.entries(MIRROR_NODE_URLS)) {
            expect(url).toMatch(/^https?:\/\//);
        }
    });
});
