import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { mockCoreModule, defaultMintNFTResult, defaultTransferNFTResult, defaultBurnNFTResult } from '../helpers/core-mock.js';

const mocks = mockCoreModule();

const { createAgreementLifecycle } = await import('../../operations/agreement-lifecycle.js');

describe('createAgreementLifecycle', () => {
    beforeEach(() => {
        mocks.mintNFT.mockClear();
        mocks.transferNFT.mockClear();
        mocks.burnNFT.mockClear();
    });

    const testConfig = {
        network: 'testnet' as const,
        operatorAccountId: '0.0.1001',
        operatorPrivateKey: '302e020100300506032b657004220420aaaa',
        supplyKey: '302e020100300506032b657004220420bbbb',
    };

    test('returns grant and revoke functions', () => {
        const lifecycle = createAgreementLifecycle({
            getCollectionId: () => '0.0.100',
        });
        expect(typeof lifecycle.grant).toBe('function');
        expect(typeof lifecycle.revoke).toBe('function');
    });

    describe('grant', () => {
        test('calls mintNFT then transferNFT in sequence', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            const result = await lifecycle.grant(
                testConfig,
                '0.0.200',
                { type: 'NDA', scope: 'project-x' }
            );

            // mintNFT called first
            expect(mocks.mintNFT).toHaveBeenCalledTimes(1);
            const [mintConfig, mintCollectionId, mintMetadata] = mocks.mintNFT.mock.calls[0];
            expect(mintConfig).toBe(testConfig);
            expect(mintCollectionId).toBe('0.0.100');
            const parsed = JSON.parse(mintMetadata[0]);
            expect(parsed.type).toBe('NDA');

            // transferNFT called second
            expect(mocks.transferNFT).toHaveBeenCalledTimes(1);
            const [transferConfig, transferCollectionId, from, to, serial] = mocks.transferNFT.mock.calls[0];
            expect(transferConfig).toBe(testConfig);
            expect(transferCollectionId).toBe('0.0.100');
            expect(from).toBe('0.0.1001'); // operator = sender
            expect(to).toBe('0.0.200'); // recipient
            expect(serial).toBe(defaultMintNFTResult.serialNumbers[0]);
        });

        test('returns GrantResult with correct shape', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            const result = await lifecycle.grant(
                testConfig,
                '0.0.200',
                { type: 'NDA' }
            );

            expect(result.success).toBe(true);
            expect(result.serialNumber).toBe(defaultMintNFTResult.serialNumbers[0]);
            expect(result.mintTransactionId).toBe(defaultMintNFTResult.transactionId);
            expect(result.transferTransactionId).toBe(defaultTransferNFTResult.transactionId);
        });

        test('auditTimestamp is null when no submitAudit provided', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            const result = await lifecycle.grant(testConfig, '0.0.200', {});
            expect(result.auditTimestamp).toBeNull();
        });

        test('calls submitAudit with grant details', async () => {
            const mockAudit = mock(() =>
                Promise.resolve({ consensusTimestamp: '1705316445.999999999' })
            );

            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
                submitAudit: mockAudit,
            });

            const result = await lifecycle.grant(
                testConfig,
                '0.0.200',
                { type: 'NDA' }
            );

            expect(mockAudit).toHaveBeenCalledTimes(1);
            expect(result.auditTimestamp).toBe('1705316445.999999999');

            const [, auditMessage] = mockAudit.mock.calls[0];
            expect(auditMessage.event).toBe('ACCESS_GRANTED');
            expect(auditMessage.recipientAccountId).toBe('0.0.200');
            expect(auditMessage.serialNumber).toBe(1);
        });

        test('throws when getCollectionId throws', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => { throw new Error('Collection ID missing'); },
            });

            expect(lifecycle.grant(testConfig, '0.0.200', {})).rejects.toThrow('Collection ID missing');
        });
    });

    describe('revoke', () => {
        test('calls burnNFT with correct arguments', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            await lifecycle.revoke(testConfig, 5, 'Contract expired');

            expect(mocks.burnNFT).toHaveBeenCalledTimes(1);
            const [config, collectionId, serialNumbers] = mocks.burnNFT.mock.calls[0];
            expect(config).toBe(testConfig);
            expect(collectionId).toBe('0.0.100');
            expect(serialNumbers).toEqual([5]);
        });

        test('returns RevokeResult with correct shape', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            const result = await lifecycle.revoke(testConfig, 5, 'Expired');

            expect(result.success).toBe(true);
            expect(result.serialNumber).toBe(5);
            expect(result.burnTransactionId).toBe(defaultBurnNFTResult.transactionId);
        });

        test('auditTimestamp is null when no submitAudit provided', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            const result = await lifecycle.revoke(testConfig, 1, 'Terminated');
            expect(result.auditTimestamp).toBeNull();
        });

        test('calls submitAudit with revoke details', async () => {
            const mockAudit = mock(() =>
                Promise.resolve({ consensusTimestamp: '1705316446.000000000' })
            );

            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
                submitAudit: mockAudit,
            });

            const result = await lifecycle.revoke(testConfig, 3, 'Policy violation');

            expect(mockAudit).toHaveBeenCalledTimes(1);
            expect(result.auditTimestamp).toBe('1705316446.000000000');

            const [, auditMessage] = mockAudit.mock.calls[0];
            expect(auditMessage.event).toBe('ACCESS_REVOKED');
            expect(auditMessage.serialNumber).toBe(3);
            expect(auditMessage.reason).toBe('Policy violation');
        });

        test('does not call mintNFT or transferNFT', async () => {
            const lifecycle = createAgreementLifecycle({
                getCollectionId: () => '0.0.100',
            });

            await lifecycle.revoke(testConfig, 1, 'Done');

            expect(mocks.mintNFT).not.toHaveBeenCalled();
            expect(mocks.transferNFT).not.toHaveBeenCalled();
        });
    });
});
