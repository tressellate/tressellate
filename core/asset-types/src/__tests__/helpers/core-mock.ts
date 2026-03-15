/**
 * Shared Layer 1 mock for Layer 3 operation factory tests.
 *
 * Mocks @tressellate/core module so that Layer 3 factories
 * can be tested without SDK or network dependencies.
 */
import { mock } from 'bun:test';

/** Default mock return values for Layer 1 functions. */
export const defaultMintNFTResult = {
    success: true,
    transactionId: '0.0.123@1705316445.000000000',
    serialNumbers: [1],
};

export const defaultMintTokenResult = {
    success: true,
    transactionId: '0.0.123@1705316445.000000001',
};

export const defaultTransferNFTResult = {
    success: true,
    transactionId: '0.0.123@1705316445.000000002',
};

export const defaultBurnNFTResult = {
    success: true,
    transactionId: '0.0.123@1705316445.000000003',
    burnedSerials: [1],
};

export const defaultNFTInfoResult = {
    tokenId: '0.0.100',
    serialNumber: 1,
    accountId: '0.0.200',
    metadata: JSON.stringify({ type: 'CERT', name: 'Test' }),
    metadataRaw: Buffer.from(JSON.stringify({ type: 'CERT', name: 'Test' })).toString('base64'),
    createdTimestamp: '1705316445.000000000',
    modifiedTimestamp: '1705316445.000000000',
    deleted: false,
    spender: null,
};

export const defaultTopicMessagesResult = {
    topicId: '0.0.500',
    messages: [
        {
            consensusTimestamp: '1705316445.000000000',
            sequenceNumber: 1,
            message: { type: 'AUDIT', action: 'MINT', schema: 'BATCHCERT' },
        },
        {
            consensusTimestamp: '1705316446.000000000',
            sequenceNumber: 2,
            message: { type: 'AUDIT', action: 'TRANSFER', schema: 'BIOCHARPROV' },
        },
    ],
    count: 2,
    links: { next: null },
};

/**
 * Install module mock for @tressellate/core.
 * Returns mock function references for assertions.
 */
export function mockCoreModule(overrides?: {
    mintNFT?: unknown;
    mintToken?: unknown;
    transferNFT?: unknown;
    burnNFT?: unknown;
    getNFTInfo?: unknown;
    getTopicMessages?: unknown;
    submitTopicMessage?: unknown;
}) {
    const mocks = {
        mintNFT: mock(() => Promise.resolve(defaultMintNFTResult)),
        mintToken: mock(() => Promise.resolve(defaultMintTokenResult)),
        transferNFT: mock(() => Promise.resolve(defaultTransferNFTResult)),
        burnNFT: mock(() => Promise.resolve(defaultBurnNFTResult)),
        getNFTInfo: mock(() => Promise.resolve(defaultNFTInfoResult)),
        getTopicMessages: mock(() => Promise.resolve(defaultTopicMessagesResult)),
        submitTopicMessage: mock(() => Promise.resolve({ consensusTimestamp: '1705316445.000000000' })),
        ...overrides,
    };

    mock.module('@tressellate/core', () => mocks);

    return mocks;
}
