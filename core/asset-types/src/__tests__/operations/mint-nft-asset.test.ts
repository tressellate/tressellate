import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { mockCoreModule, defaultMintNFTResult } from '../helpers/core-mock.js';

// Install core mock before importing source modules
const mocks = mockCoreModule();

// Dynamic import after mock is installed
const { createMintNFTAsset } = await import('../../operations/mint-nft-asset.js');

describe('createMintNFTAsset', () => {
    beforeEach(() => {
        mocks.mintNFT.mockClear();
    });

    const testConfig = {
        network: 'testnet' as const,
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b657004220420aaaa',
        supplyKey: '302e020100300506032b657004220420bbbb',
    };

    test('returns a function', () => {
        const mint = createMintNFTAsset({
            assetType: 'Certificate',
            schemaType: 'BATCHCERT',
            getCollectionId: () => '0.0.100',
            buildMetadata: () => ({ batch: 'B001' }),
        });
        expect(typeof mint).toBe('function');
    });

    test('calls mintNFT with correct arguments', async () => {
        const mint = createMintNFTAsset({
            assetType: 'Certificate',
            schemaType: 'BATCHCERT',
            getCollectionId: () => '0.0.100',
            buildMetadata: (args: { batch: string }) => ({ batch: args.batch }),
        });

        await mint({ batch: 'B001' }, testConfig);

        expect(mocks.mintNFT).toHaveBeenCalledTimes(1);
        const [config, collectionId, metadataArr] = mocks.mintNFT.mock.calls[0];
        expect(config).toBe(testConfig);
        expect(collectionId).toBe('0.0.100');
        // metadata is JSON stringified with type prepended
        const parsed = JSON.parse(metadataArr[0]);
        expect(parsed.type).toBe('BATCHCERT');
        expect(parsed.batch).toBe('B001');
    });

    test('returns AssetOperationResult with correct shape', async () => {
        const mint = createMintNFTAsset({
            assetType: 'Certificate',
            schemaType: 'BATCHCERT',
            getCollectionId: () => '0.0.100',
            buildMetadata: () => ({ batch: 'B001' }),
        });

        const result = await mint({}, testConfig);

        expect(result.success).toBe(true);
        expect(result.schemaType).toBe('BATCHCERT');
        expect(result.assetType).toBe('Certificate');
        expect(result.serialNumber).toBe(defaultMintNFTResult.serialNumbers[0]);
        expect(result.transactionId).toBe(defaultMintNFTResult.transactionId);
        expect(result.tokenId).toBe('0.0.100');
        expect(result.metadata).toBeDefined();
        expect(result.metadata?.type).toBe('BATCHCERT');
    });

    test('auditTimestamp is null when no submitAudit provided', async () => {
        const mint = createMintNFTAsset({
            assetType: 'Provenance',
            schemaType: 'BIOCHARPROV',
            getCollectionId: () => '0.0.200',
            buildMetadata: () => ({ source: 'farm' }),
        });

        const result = await mint({}, testConfig);
        expect(result.auditTimestamp).toBeNull();
    });

    test('calls submitAudit when provided', async () => {
        const mockAudit = mock(() =>
            Promise.resolve({ consensusTimestamp: '1705316445.999999999' })
        );

        const mint = createMintNFTAsset({
            assetType: 'Certificate',
            schemaType: 'BATCHCERT',
            getCollectionId: () => '0.0.100',
            buildMetadata: () => ({ batch: 'B001' }),
            submitAudit: mockAudit,
        });

        const result = await mint({}, testConfig);

        expect(mockAudit).toHaveBeenCalledTimes(1);
        expect(result.auditTimestamp).toBe('1705316445.999999999');

        // Verify audit was called with metadata and mint result
        const [auditConfig, auditMetadata, auditMintResult] = mockAudit.mock.calls[0];
        expect(auditConfig).toBe(testConfig);
        expect(auditMetadata.type).toBe('BATCHCERT');
        expect(auditMintResult.serialNumber).toBe(1);
        expect(auditMintResult.transactionId).toBe(defaultMintNFTResult.transactionId);
    });

    test('throws when getCollectionId throws', async () => {
        const mint = createMintNFTAsset({
            assetType: 'Certificate',
            schemaType: 'BATCHCERT',
            getCollectionId: () => { throw new Error('Collection ID missing'); },
            buildMetadata: () => ({}),
        });

        expect(mint({}, testConfig)).rejects.toThrow('Collection ID missing');
    });

    test('merges buildMetadata with type field', async () => {
        const mint = createMintNFTAsset({
            assetType: 'Inspection',
            schemaType: 'QUALITY_INSPECTION',
            getCollectionId: () => '0.0.300',
            buildMetadata: (args: { result: string }) => ({
                result: args.result,
                inspector: 'INS-001',
            }),
        });

        const result = await mint({ result: 'PASS' }, testConfig);

        const metadata = result.metadata as Record<string, unknown>;
        expect(metadata.type).toBe('QUALITY_INSPECTION');
        expect(metadata.result).toBe('PASS');
        expect(metadata.inspector).toBe('INS-001');
    });
});
