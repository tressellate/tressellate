import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mockSDKModule, createTestConfig } from '../helpers/sdk-mock.js';
import {
    installFetchMock,
    restoreFetch,
    mockNFTInfoResponse,
    mockAccountNFTsResponse,
} from '../helpers/fetch-mock.js';

// Install SDK mock before importing (needed for SDK-dependent functions)
mockSDKModule();

const {
    getNFTInfo,
    getAccountNFTs,
    verifyContractHolder,
    createNFTCollection,
    mintNFT,
    transferNFT,
    burnNFT,
} = await import('../../tools/nft.js');

const config = createTestConfig();

// --- Mirror Node Functions ---

describe('getNFTInfo', () => {
    afterEach(() => restoreFetch());

    test('returns NFT info with decoded metadata', async () => {
        installFetchMock([
            { pattern: '/tokens/', data: mockNFTInfoResponse() },
        ]);
        const result = await getNFTInfo(config, '0.0.100', 1);
        expect(result.tokenId).toBe('0.0.100');
        expect(result.serialNumber).toBe(1);
        expect(result.accountId).toBe('0.0.200');
        expect(result.metadata).toBeDefined();
        // Should decode base64 metadata
        const parsed = JSON.parse(result.metadata!);
        expect(parsed.type).toBe('CERT');
    });

    test('handles NFT with no metadata', async () => {
        installFetchMock([
            { pattern: '/tokens/', data: mockNFTInfoResponse({ metadata: null }) },
        ]);
        const result = await getNFTInfo(config, '0.0.100', 1);
        expect(result.metadata).toBeNull();
    });

    test('throws on non-ok response', async () => {
        installFetchMock([
            { pattern: '/tokens/', data: {}, status: 404, ok: false },
        ]);
        expect(getNFTInfo(config, '0.0.100', 1)).rejects.toThrow('Mirror node error');
    });

    test('constructs correct URL', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/tokens/', data: mockNFTInfoResponse() },
        ]);
        await getNFTInfo(config, '0.0.100', 5);
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('/tokens/0.0.100/nfts/5');
    });
});

describe('getAccountNFTs', () => {
    afterEach(() => restoreFetch());

    test('returns array of NFTs', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: mockAccountNFTsResponse() },
        ]);
        const result = await getAccountNFTs(config, '0.0.200');
        expect(result.nfts.length).toBe(1);
        expect(result.accountId).toBe('0.0.200');
    });

    test('decodes metadata in each NFT', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: mockAccountNFTsResponse() },
        ]);
        const result = await getAccountNFTs(config, '0.0.200');
        expect(result.nfts[0].metadata).toBeDefined();
        const parsed = JSON.parse(result.nfts[0].metadata!);
        expect(parsed.type).toBe('NDA');
    });

    test('filters by tokenId when provided', async () => {
        const fetchMock = installFetchMock([
            { pattern: '/accounts/', data: mockAccountNFTsResponse() },
        ]);
        await getAccountNFTs(config, '0.0.200', '0.0.100');
        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain('token.id=0.0.100');
    });

    test('handles empty NFT list', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: { nfts: [], links: { next: null } } },
        ]);
        const result = await getAccountNFTs(config, '0.0.200');
        expect(result.nfts).toEqual([]);
    });

    test('throws on non-ok response', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: {}, status: 404, ok: false },
        ]);
        expect(getAccountNFTs(config, '0.0.200')).rejects.toThrow('Mirror node error');
    });
});

describe('verifyContractHolder', () => {
    afterEach(() => restoreFetch());

    test('returns hasAccess=true for matching contract', async () => {
        const metadata = {
            type: 'NDA',
            projectId: 'P1',
            grantedAt: '2024-01-01T00:00:00Z',
            expiresAt: '2099-12-31T23:59:59Z',
            termsHash: 'abc123',
            version: '1.0',
        };
        installFetchMock([
            {
                pattern: '/accounts/',
                data: mockAccountNFTsResponse([
                    {
                        token_id: '0.0.100',
                        serial_number: 1,
                        metadata: Buffer.from(JSON.stringify(metadata)).toString('base64'),
                        created_timestamp: '1705316445.000000000',
                        spender: null,
                    },
                ]),
            },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
        });
        expect(result.hasAccess).toBe(true);
        expect(result.contractType).toBe('NDA');
    });

    test('returns hasAccess=false when no NFTs found', async () => {
        installFetchMock([
            { pattern: '/accounts/', data: { nfts: [], links: { next: null } } },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
        });
        expect(result.hasAccess).toBe(false);
        expect(result.reason).toContain('does not hold any NFTs');
    });

    test('returns hasAccess=false when contract type does not match', async () => {
        const metadata = { type: 'EPC', projectId: 'P1' };
        installFetchMock([
            {
                pattern: '/accounts/',
                data: mockAccountNFTsResponse([
                    {
                        token_id: '0.0.100',
                        serial_number: 1,
                        metadata: Buffer.from(JSON.stringify(metadata)).toString('base64'),
                        created_timestamp: '1705316445.000000000',
                        spender: null,
                    },
                ]),
            },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
        });
        expect(result.hasAccess).toBe(false);
        expect(result.reason).toContain('No valid NDA contract found');
    });

    test('returns hasAccess=false when contract is expired', async () => {
        const metadata = {
            type: 'NDA',
            projectId: 'P1',
            expiresAt: '2020-01-01T00:00:00Z', // Past date
        };
        installFetchMock([
            {
                pattern: '/accounts/',
                data: mockAccountNFTsResponse([
                    {
                        token_id: '0.0.100',
                        serial_number: 1,
                        metadata: Buffer.from(JSON.stringify(metadata)).toString('base64'),
                        created_timestamp: '1705316445.000000000',
                        spender: null,
                    },
                ]),
            },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
        });
        expect(result.hasAccess).toBe(false);
        expect(result.reason).toBe('Contract has expired');
    });

    test('skips expiry check when checkExpiry=false', async () => {
        const metadata = {
            type: 'NDA',
            projectId: 'P1',
            expiresAt: '2020-01-01T00:00:00Z', // Past date
        };
        installFetchMock([
            {
                pattern: '/accounts/',
                data: mockAccountNFTsResponse([
                    {
                        token_id: '0.0.100',
                        serial_number: 1,
                        metadata: Buffer.from(JSON.stringify(metadata)).toString('base64'),
                        created_timestamp: '1705316445.000000000',
                        spender: null,
                    },
                ]),
            },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
            checkExpiry: false,
        });
        expect(result.hasAccess).toBe(true);
    });

    test('filters by projectId when specified', async () => {
        const metadata = { type: 'NDA', projectId: 'P2' };
        installFetchMock([
            {
                pattern: '/accounts/',
                data: mockAccountNFTsResponse([
                    {
                        token_id: '0.0.100',
                        serial_number: 1,
                        metadata: Buffer.from(JSON.stringify(metadata)).toString('base64'),
                        created_timestamp: '1705316445.000000000',
                        spender: null,
                    },
                ]),
            },
        ]);

        const result = await verifyContractHolder(config, {
            tokenId: '0.0.100',
            accountId: '0.0.200',
            contractType: 'NDA',
            projectId: 'P1', // Doesn't match P2
        });
        expect(result.hasAccess).toBe(false);
    });
});

// --- SDK Transaction Functions ---

describe('createNFTCollection', () => {
    test('returns success with tokenId', async () => {
        const result = await createNFTCollection(config, { tokenName: 'TestNFT', tokenSymbol: 'TNFT' });
        expect(result.success).toBe(true);
        expect(result.tokenId).toBeDefined();
    });

    test('uses default name and symbol when not provided', async () => {
        const result = await createNFTCollection(config, {});
        expect(result.success).toBe(true);
    });
});

describe('mintNFT', () => {
    test('returns success with serial numbers', async () => {
        const result = await mintNFT(config, '0.0.100', ['{"type":"test"}']);
        expect(result.success).toBe(true);
        expect(result.serialNumbers).toBeDefined();
        expect(Array.isArray(result.serialNumbers)).toBe(true);
    });
});

describe('transferNFT', () => {
    test('returns success with transaction ID', async () => {
        const result = await transferNFT(config, '0.0.100', '0.0.200', '0.0.300', 1);
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });
});

describe('burnNFT', () => {
    test('returns success with burned serials', async () => {
        const result = await burnNFT(config, '0.0.100', [1, 2]);
        expect(result.success).toBe(true);
        expect(result.burnedSerials).toEqual([1, 2]);
    });
});
