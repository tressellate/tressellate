import { describe, test, expect, afterEach } from 'bun:test';
import { mockSDKModule, createTestConfig } from '../helpers/sdk-mock.js';
import {
    installFetchMock,
    restoreFetch,
    mockAccountInfoResponse,
    mockAccountTokensResponse,
} from '../helpers/fetch-mock.js';

// Install SDK mock before importing
mockSDKModule();

const { createAccount, getAccountInfo } = await import('../../tools/account.js');

const config = createTestConfig();

// --- Mirror Node Functions ---

describe('getAccountInfo', () => {
    afterEach(() => restoreFetch());

    test('returns account details with balance', async () => {
        installFetchMock([
            { pattern: '/accounts/0.0.200/tokens', data: mockAccountTokensResponse() },
            { pattern: '/accounts/0.0.200', data: mockAccountInfoResponse() },
        ]);
        const result = await getAccountInfo(config, '0.0.200');
        expect(result.accountId).toBe('0.0.200');
        expect(result.balance.tinybar).toBe(1_000_000_000);
        expect(result.balance.hbar).toBe('10.00000000');
    });

    test('returns associated tokens', async () => {
        installFetchMock([
            { pattern: '/accounts/0.0.200/tokens', data: mockAccountTokensResponse() },
            { pattern: '/accounts/0.0.200', data: mockAccountInfoResponse() },
        ]);
        const result = await getAccountInfo(config, '0.0.200');
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].tokenId).toBe('0.0.100');
        expect(result.tokens[0].balance).toBe(500);
    });

    test('throws when account not found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: {}, status: 404, ok: false },
        ]);
        expect(getAccountInfo(config, '0.0.999')).rejects.toThrow('Account not found');
    });

    test('returns isDeleted status', async () => {
        installFetchMock([
            { pattern: '/accounts/0.0.200/tokens', data: { tokens: [] } },
            { pattern: '/accounts/0.0.200', data: mockAccountInfoResponse({ deleted: true }) },
        ]);
        const result = await getAccountInfo(config, '0.0.200');
        expect(result.isDeleted).toBe(true);
    });
});

// --- SDK Transaction Functions ---

describe('createAccount', () => {
    test('returns success with accountId and keys', async () => {
        const result = await createAccount(config, { initialBalance: 1 });
        expect(result.success).toBe(true);
        expect(result.accountId).toBeDefined();
        expect(result.publicKey).toBeDefined();
        expect(result.privateKey).toBeDefined();
    });

    test('uses default initial balance', async () => {
        const result = await createAccount(config, {});
        expect(result.success).toBe(true);
    });
});
