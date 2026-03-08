import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import {
    installFetchMock,
    restoreFetch,
    mockTokenBalanceResponse,
    mockTokenInfoResponse,
    mockTransactionResponse,
    mockTokenTransactionHistoryResponse,
} from '../helpers/fetch-mock.js';
import { createTestConfig } from '../helpers/sdk-mock.js';
import {
    getTokenBalance,
    getTokenTransactionHistory,
    getTokenInfo,
    checkTokenAssociation,
    getTransactionReceipt,
} from '../../tools/query.js';

const config = createTestConfig();

describe('getTokenBalance', () => {
    afterEach(() => restoreFetch());

    test('returns balance when token is found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: mockTokenBalanceResponse() },
        ]);
        const result = await getTokenBalance(config, '0.0.200', '0.0.100');
        expect(result.balance).toBe(1000);
        expect(result.associated).toBe(true);
        expect(result.accountId).toBe('0.0.200');
        expect(result.tokenId).toBe('0.0.100');
    });

    test('returns zero balance when token not found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: { tokens: [] } },
        ]);
        const result = await getTokenBalance(config, '0.0.200', '0.0.100');
        expect(result.balance).toBe(0);
        expect(result.associated).toBe(false);
    });

    test('constructs correct URL with mirror node', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/accounts/', data: mockTokenBalanceResponse() },
        ]);
        await getTokenBalance(config, '0.0.200', '0.0.100');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('testnet.mirrornode.hedera.com');
        expect(url).toContain('/accounts/0.0.200/tokens');
        expect(url).toContain('token.id=0.0.100');
    });

    test('uses custom mirrorNodeUrl when provided', async () => {
        const customConfig = createTestConfig({ mirrorNodeUrl: 'https://custom.mirror.com/api/v1' });
        const fetchMock = installFetchMock([
            { pattern: '/accounts/', data: mockTokenBalanceResponse() },
        ]);
        await getTokenBalance(customConfig, '0.0.200', '0.0.100');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('custom.mirror.com');
    });
});

describe('getTokenTransactionHistory', () => {
    afterEach(() => restoreFetch());

    test('returns transaction history', async () => {
        installFetchMock([
            { pattern: '/transactions', data: mockTokenTransactionHistoryResponse('0.0.100', '0.0.200') },
        ]);
        const result = await getTokenTransactionHistory(config, '0.0.200', '0.0.100');
        expect(result.transactions.length).toBeGreaterThan(0);
        expect(result.accountId).toBe('0.0.200');
        expect(result.tokenId).toBe('0.0.100');
    });

    test('detects RECEIVED transaction type', async () => {
        installFetchMock([
            {
                pattern: '/transactions',
                data: mockTokenTransactionHistoryResponse('0.0.100', '0.0.200'),
            },
        ]);
        const result = await getTokenTransactionHistory(config, '0.0.200', '0.0.100');
        expect(result.transactions[0].type).toBe('RECEIVED');
        expect(result.transactions[0].amount).toBe(100);
    });

    test('handles empty transaction list', async () => {
        installFetchMock([
            { pattern: '/transactions', data: { transactions: [] } },
        ]);
        const result = await getTokenTransactionHistory(config, '0.0.200', '0.0.100');
        expect(result.transactions).toEqual([]);
    });

    test('respects limit parameter', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/transactions', data: { transactions: [] } },
        ]);
        await getTokenTransactionHistory(config, '0.0.200', '0.0.100', { limit: 10 });
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('limit=10');
    });
});

describe('getTokenInfo', () => {
    afterEach(() => restoreFetch());

    test('returns token metadata', async () => {
        installFetchMock([
            { pattern: '/tokens/', data: mockTokenInfoResponse() },
        ]);
        const result = await getTokenInfo(config, '0.0.100');
        expect(result.tokenId).toBe('0.0.100');
        expect(result.name).toBe('Test Token');
        expect(result.symbol).toBe('TST');
        expect(result.network).toBe('testnet');
    });

    test('calculates circulating supply with treasury', async () => {
        installFetchMock([
            { pattern: '/tokens/0.0.100', data: mockTokenInfoResponse({ total_supply: '10000' }) },
            { pattern: '/accounts/', data: { tokens: [{ balance: 3000 }] } },
        ]);
        const result = await getTokenInfo(config, '0.0.100', '0.0.999');
        expect(result.treasuryBalance).toBe(3000);
        expect(result.circulatingSupply).toBe(7000);
    });

    test('returns null circulating supply without treasury', async () => {
        installFetchMock([
            { pattern: '/tokens/', data: mockTokenInfoResponse() },
        ]);
        const result = await getTokenInfo(config, '0.0.100');
        expect(result.treasuryBalance).toBeNull();
        expect(result.circulatingSupply).toBeNull();
    });
});

describe('checkTokenAssociation', () => {
    afterEach(() => restoreFetch());

    test('returns associated=true when token found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: mockTokenBalanceResponse() },
        ]);
        const result = await checkTokenAssociation(config, '0.0.200', '0.0.100');
        expect(result.associated).toBe(true);
        expect(result.balance).toBe(1000);
    });

    test('returns associated=false when token not found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: { tokens: [] } },
        ]);
        const result = await checkTokenAssociation(config, '0.0.200', '0.0.100');
        expect(result.associated).toBe(false);
        expect(result.balance).toBe(0);
    });
});

describe('getTransactionReceipt', () => {
    afterEach(() => restoreFetch());

    test('returns transaction details', async () => {
        installFetchMock([
            { pattern: '/transactions/', data: mockTransactionResponse() },
        ]);
        const result = await getTransactionReceipt(config, '0.0.1001@1705316445.000000000');
        expect(result.result).toBe('SUCCESS');
        expect(result.transactionId).toBeDefined();
        expect(result.memo).toBe('test memo');
    });

    test('handles transaction not found', async () => {
        installFetchMock([
            { pattern: '/transactions/', data: { transactions: [] } },
        ]);
        const result = await getTransactionReceipt(config, '0.0.9999@0.0');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Transaction not found');
    });

    test('normalizes transaction ID format', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/transactions/', data: mockTransactionResponse() },
        ]);
        await getTransactionReceipt(config, '0.0.1001@1705316445.000000000');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('/transactions/');
    });
});
