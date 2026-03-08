/**
 * Shared fetch mock helpers for mirror node tests.
 *
 * Replaces globalThis.fetch with a URL-pattern-based mock
 * that routes responses based on URL substrings.
 */
import { mock } from 'bun:test';

/** A route entry: URL substring → response data. */
export interface FetchRoute {
    /** Substring to match against the URL. */
    pattern: string;
    /** Response body (will be returned by .json()). */
    data: unknown;
    /** HTTP status code (default 200). */
    status?: number;
    /** Whether response.ok should be true (default true). */
    ok?: boolean;
}

const originalFetch = globalThis.fetch;

/**
 * Install a fetch mock that routes based on URL patterns.
 * First matching route wins.
 */
export function installFetchMock(routes: FetchRoute[]) {
    const fetchMock = mock((url: string | URL | Request) => {
        const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;

        for (const route of routes) {
            if (urlStr.includes(route.pattern)) {
                return Promise.resolve({
                    ok: route.ok ?? true,
                    status: route.status ?? 200,
                    statusText: route.status === 404 ? 'Not Found' : 'OK',
                    json: () => Promise.resolve(route.data),
                    text: () => Promise.resolve(JSON.stringify(route.data)),
                } as Response);
            }
        }

        // Default: empty 200 response
        return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: () => Promise.resolve({}),
            text: () => Promise.resolve('{}'),
        } as Response);
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
}

/** Restore the original fetch. */
export function restoreFetch() {
    globalThis.fetch = originalFetch;
}

// --- Pre-built response factories ---

export function mockNFTInfoResponse(overrides?: Partial<Record<string, unknown>>) {
    return {
        token_id: '0.0.100',
        serial_number: 1,
        account_id: '0.0.200',
        metadata: Buffer.from(JSON.stringify({ type: 'CERT', name: 'Test' })).toString('base64'),
        created_timestamp: '1705316445.000000000',
        modified_timestamp: '1705316445.000000000',
        deleted: false,
        spender: null,
        ...overrides,
    };
}

export function mockAccountNFTsResponse(nfts?: Record<string, unknown>[]) {
    return {
        nfts: nfts ?? [
            {
                token_id: '0.0.100',
                serial_number: 1,
                metadata: Buffer.from(JSON.stringify({ type: 'NDA', projectId: 'P1' })).toString('base64'),
                created_timestamp: '1705316445.000000000',
                spender: null,
            },
        ],
        links: { next: null },
    };
}

export function mockAccountInfoResponse(overrides?: Partial<Record<string, unknown>>) {
    return {
        balance: { balance: 1_000_000_000 },
        key: { _type: 'ED25519', key: 'abc123' },
        memo: 'test-account',
        auto_renew_period: 7776000,
        created_timestamp: '1705316445.000000000',
        deleted: false,
        ...overrides,
    };
}

export function mockAccountTokensResponse(tokens?: Array<Record<string, unknown>>) {
    return {
        tokens: tokens ?? [
            { token_id: '0.0.100', balance: 500, freeze_status: 'NOT_APPLICABLE' },
        ],
    };
}

export function mockTopicMessagesResponse(messages?: Array<Record<string, unknown>>) {
    return {
        messages: messages ?? [
            {
                consensus_timestamp: '1705316445.000000000',
                sequence_number: 1,
                message: Buffer.from(JSON.stringify({ type: 'AUDIT', action: 'MINT' })).toString('base64'),
            },
        ],
        links: { next: null },
    };
}

export function mockTokenBalanceResponse(overrides?: Partial<Record<string, unknown>>) {
    return {
        tokens: [
            {
                token_id: '0.0.100',
                balance: 1000,
                ...overrides,
            },
        ],
    };
}

export function mockTokenInfoResponse(overrides?: Partial<Record<string, unknown>>) {
    return {
        name: 'Test Token',
        symbol: 'TST',
        decimals: '2',
        total_supply: '10000',
        created_timestamp: '1705316445.000000000',
        ...overrides,
    };
}

export function mockTransactionResponse(overrides?: Partial<Record<string, unknown>>) {
    return {
        transactions: [
            {
                transaction_id: '0.0.1001-1705316445-000000000',
                consensus_timestamp: '1705316445.000000000',
                result: 'SUCCESS',
                name: 'CRYPTOTRANSFER',
                charged_tx_fee: 500000,
                transfers: [],
                token_transfers: [],
                memo_base64: Buffer.from('test memo').toString('base64'),
                ...overrides,
            },
        ],
    };
}

export function mockTokenTransactionHistoryResponse(
    tokenId: string = '0.0.100',
    accountId: string = '0.0.200'
) {
    return {
        transactions: [
            {
                transaction_id: '0.0.1001-1705316445-000000000',
                consensus_timestamp: '1705316445.000000000',
                token_transfers: [
                    { token_id: tokenId, account: accountId, amount: 100 },
                ],
                memo_base64: Buffer.from('transfer').toString('base64'),
            },
        ],
        links: { next: null },
    };
}
