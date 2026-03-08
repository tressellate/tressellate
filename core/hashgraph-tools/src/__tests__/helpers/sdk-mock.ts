/**
 * Shared SDK mock helpers for Layer 1 tests.
 *
 * Provides a Proxy-based mock that handles the deeply-chained
 * Hedera SDK builder pattern:
 *   new XTransaction().setFoo().setBar().freezeWith(client).sign(key).execute(client)
 */
import { mock } from 'bun:test';
import type { HederaConfig } from '../../config.js';

/** Default receipt data returned by mocked transactions. */
export interface MockReceiptData {
    tokenId?: { toString: () => string };
    accountId?: { toString: () => string };
    topicId?: { toString: () => string };
    status?: { toString: () => string };
    serials?: Array<{ toNumber: () => number }>;
    topicSequenceNumber?: { toString: () => string; toNumber: () => number };
}

const defaultReceipt: MockReceiptData = {
    tokenId: { toString: () => '0.0.999' },
    accountId: { toString: () => '0.0.888' },
    topicId: { toString: () => '0.0.777' },
    status: { toString: () => 'SUCCESS' },
    serials: [{ toNumber: () => 1 }],
    topicSequenceNumber: { toString: () => '1', toNumber: () => 1 },
};

/**
 * Creates a Proxy-based mock transaction that handles any builder-chain depth.
 * Every setter returns `this` (the proxy), terminal methods resolve promises.
 */
export function createMockTransaction(receiptOverrides?: Partial<MockReceiptData>) {
    const receipt = { ...defaultReceipt, ...receiptOverrides };

    const mockResponse = {
        transactionId: { toString: () => '0.0.123@1705316445.000000000' },
        getReceipt: mock(() => Promise.resolve(receipt)),
    };

    const handler: ProxyHandler<Record<string, unknown>> = {
        get(_target, prop: string) {
            // Terminal async methods
            if (prop === 'execute') return mock(() => Promise.resolve(mockResponse));
            if (prop === 'getReceipt') return mock(() => Promise.resolve(receipt));
            // sign() returns proxy (awaitable chain)
            if (prop === 'sign') return mock(() => Promise.resolve(proxy));
            // freezeWith() returns proxy synchronously
            if (prop === 'freezeWith') return mock(() => proxy);
            // then() — allows `await tx.freezeWith(client).sign(key)` when the chain
            // goes through an await boundary; delegate to the proxy itself
            if (prop === 'then') return undefined; // not thenable by default
            // All setters return the proxy
            return mock(() => proxy);
        },
    };

    const proxy: Record<string, unknown> = new Proxy({}, handler);
    return proxy;
}

/** A mock Hedera Client. */
export function createMockClient() {
    return {
        setOperator: mock(() => {}),
        close: mock(() => {}),
    };
}

/** Valid test HederaConfig. */
export function createTestConfig(overrides?: Partial<HederaConfig>): HederaConfig {
    return {
        network: 'testnet',
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137',
        supplyKey: '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137',
        ...overrides,
    };
}

/**
 * Installs mock.module for @hashgraph/sdk with all transaction/type classes.
 * Returns references to mock constructors for assertions.
 */
export function mockSDKModule(receiptOverrides?: Partial<MockReceiptData>) {
    const mocks = {
        TokenCreateTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TokenMintTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TransferTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TokenBurnTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TokenAssociateTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TopicCreateTransaction: mock(() => createMockTransaction(receiptOverrides)),
        TopicMessageSubmitTransaction: mock(() => createMockTransaction(receiptOverrides)),
        AccountCreateTransaction: mock(() => createMockTransaction(receiptOverrides)),
    };

    const mockClient = createMockClient();

    mock.module('@hashgraph/sdk', () => ({
        ...mocks,
        Client: {
            forTestnet: mock(() => mockClient),
            forPreviewnet: mock(() => mockClient),
            forMainnet: mock(() => mockClient),
        },
        AccountId: { fromString: mock((s: string) => ({ toString: () => s })) },
        PrivateKey: {
            fromString: mock((_s: string) => ({
                publicKey: { toString: () => 'mock-public-key' },
                toString: () => 'mock-private-key',
            })),
            generateED25519: mock(() => ({
                publicKey: { toString: () => 'mock-public-key' },
                toString: () => 'mock-private-key',
            })),
        },
        TokenId: { fromString: mock((s: string) => ({ toString: () => s })) },
        TopicId: { fromString: mock((s: string) => ({ toString: () => s })) },
        NftId: mock((_tokenId: unknown, _serial: number) => ({})),
        Hbar: mock((v: number) => ({ toTinybars: () => v * 100_000_000 })),
        TokenType: { FungibleCommon: 'FUNGIBLE_COMMON', NonFungibleUnique: 'NON_FUNGIBLE_UNIQUE' },
        TokenSupplyType: { Infinite: 'INFINITE', Finite: 'FINITE' },
    }));

    return { ...mocks, mockClient };
}
