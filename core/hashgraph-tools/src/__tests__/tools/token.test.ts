import { describe, test, expect } from 'bun:test';
import { mockSDKModule, createTestConfig } from '../helpers/sdk-mock.js';

// Install SDK mock before importing
mockSDKModule();

const {
    createToken,
    mintToken,
    transferToken,
    burnToken,
    associateToken,
} = await import('../../tools/token.js');

const config = createTestConfig();

describe('createToken', () => {
    test('returns success with tokenId', async () => {
        const result = await createToken(config, {
            tokenName: 'TestToken',
            tokenSymbol: 'TST',
            decimals: 2,
            initialSupply: 1000,
        });
        expect(result.success).toBe(true);
        expect(result.tokenId).toBeDefined();
    });

    test('uses defaults when options are empty', async () => {
        const result = await createToken(config, {});
        expect(result.success).toBe(true);
        expect(result.tokenId).toBeDefined();
    });
});

describe('mintToken', () => {
    test('returns success with transactionId', async () => {
        const result = await mintToken(config, '0.0.100', 500);
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });
});

describe('transferToken', () => {
    test('returns success with transactionId', async () => {
        const result = await transferToken(config, '0.0.100', '0.0.200', '0.0.300', 100);
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });
});

describe('burnToken', () => {
    test('returns success with transactionId', async () => {
        const result = await burnToken(config, '0.0.100', 50);
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });
});

describe('associateToken', () => {
    test('returns success with account and token info', async () => {
        const result = await associateToken(config, '0.0.100', '0.0.200');
        expect(result.success).toBe(true);
        expect(result.accountId).toBe('0.0.200');
        expect(result.tokenId).toBe('0.0.100');
        expect(result.transactionId).toBeDefined();
    });

    test('uses operator key when accountPrivateKey not provided', async () => {
        const result = await associateToken(config, '0.0.100', '0.0.200');
        expect(result.success).toBe(true);
    });

    test('uses custom accountPrivateKey when provided', async () => {
        const result = await associateToken(
            config,
            '0.0.100',
            '0.0.200',
            '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137'
        );
        expect(result.success).toBe(true);
    });
});
