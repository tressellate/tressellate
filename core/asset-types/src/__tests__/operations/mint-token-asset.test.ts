import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { mockCoreModule, defaultMintTokenResult } from '../helpers/core-mock.js';

// Install core mock before importing source modules
const mocks = mockCoreModule();

// Dynamic import after mock is installed
const { createMintTokenAsset } = await import('../../operations/mint-token-asset.js');

describe('createMintTokenAsset', () => {
    beforeEach(() => {
        mocks.mintToken.mockClear();
    });

    const testConfig = {
        network: 'testnet' as const,
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b657004220420aaaa',
        supplyKey: '302e020100300506032b657004220420bbbb',
    };

    test('returns a function', () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'SOILCARBON',
            getTokenId: () => '0.0.300',
            getAmount: () => 100,
        });
        expect(typeof mint).toBe('function');
    });

    test('calls mintToken with correct arguments', async () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'SOILCARBON',
            getTokenId: () => '0.0.300',
            getAmount: (args: { amount: number }) => args.amount,
        });

        await mint({ amount: 500 }, testConfig);

        expect(mocks.mintToken).toHaveBeenCalledTimes(1);
        const [config, tokenId, amount] = mocks.mintToken.mock.calls[0];
        expect(config).toBe(testConfig);
        expect(tokenId).toBe('0.0.300');
        expect(amount).toBe(500);
    });

    test('returns AssetOperationResult with correct shape', async () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'SOILCARBON',
            getTokenId: () => '0.0.300',
            getAmount: () => 250,
        });

        const result = await mint({}, testConfig);

        expect(result.success).toBe(true);
        expect(result.schemaType).toBe('SOILCARBON');
        expect(result.assetType).toBe('Credit');
        expect(result.amount).toBe(250);
        expect(result.transactionId).toBe(defaultMintTokenResult.transactionId);
        expect(result.tokenId).toBe('0.0.300');
    });

    test('auditTimestamp is null when no submitAudit provided', async () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'CARBON',
            getTokenId: () => '0.0.400',
            getAmount: () => 100,
        });

        const result = await mint({}, testConfig);
        expect(result.auditTimestamp).toBeNull();
    });

    test('calls submitAudit when provided', async () => {
        const mockAudit = mock(() =>
            Promise.resolve({ consensusTimestamp: '1705316445.999999999' })
        );

        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'SOILCARBON',
            getTokenId: () => '0.0.300',
            getAmount: (args: { qty: number }) => args.qty,
            submitAudit: mockAudit,
        });

        const result = await mint({ qty: 100 }, testConfig);

        expect(mockAudit).toHaveBeenCalledTimes(1);
        expect(result.auditTimestamp).toBe('1705316445.999999999');

        // Verify audit called with correct args
        const [auditConfig, auditArgs, auditMintResult] = mockAudit.mock.calls[0];
        expect(auditConfig).toBe(testConfig);
        expect(auditArgs.qty).toBe(100);
        expect(auditMintResult.transactionId).toBe(defaultMintTokenResult.transactionId);
        expect(auditMintResult.tokenId).toBe('0.0.300');
        expect(auditMintResult.amount).toBe(100);
    });

    test('throws when getTokenId throws', async () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'SOILCARBON',
            getTokenId: () => { throw new Error('Token ID missing'); },
            getAmount: () => 100,
        });

        expect(mint({}, testConfig)).rejects.toThrow('Token ID missing');
    });

    test('does not include serialNumber for fungible tokens', async () => {
        const mint = createMintTokenAsset({
            assetType: 'Credit',
            schemaType: 'CARBON',
            getTokenId: () => '0.0.500',
            getAmount: () => 1000,
        });

        const result = await mint({}, testConfig);
        expect(result.serialNumber).toBeUndefined();
    });
});
