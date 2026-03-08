import { describe, test, expect } from 'bun:test';
import type {
    VerifiableCredential,
    PersonaCredential,
    Policy,
} from '../types.js';
import type { GuardianConfig } from '../config.js';

describe('VerifiableCredential', () => {
    test('satisfies W3C shape', () => {
        const vc: VerifiableCredential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'PersonaCredential'],
            issuer: 'did:hedera:testnet:0.0.100',
            issuanceDate: '2024-01-15T10:00:00Z',
            credentialSubject: { id: 'did:hedera:testnet:0.0.200', role: 'inspector' },
        };
        expect(vc['@context']).toHaveLength(1);
        expect(vc.type).toContain('VerifiableCredential');
        expect(vc.issuer).toContain('did:hedera');
        expect(vc.issuanceDate).toBe('2024-01-15T10:00:00Z');
        expect(vc.credentialSubject.role).toBe('inspector');
    });

    test('proof is optional', () => {
        const vc: VerifiableCredential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuer: 'did:hedera:testnet:0.0.100',
            issuanceDate: '2024-01-15T10:00:00Z',
            credentialSubject: {},
        };
        expect(vc.proof).toBeUndefined();
    });

    test('includes proof when present', () => {
        const vc: VerifiableCredential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuer: 'did:hedera:testnet:0.0.100',
            issuanceDate: '2024-01-15T10:00:00Z',
            credentialSubject: {},
            proof: {
                type: 'Ed25519Signature2020',
                verificationMethod: 'did:hedera:testnet:0.0.100#key-1',
                proofValue: 'zBase58Signature',
            },
        };
        expect(vc.proof?.type).toBe('Ed25519Signature2020');
    });
});

describe('PersonaCredential', () => {
    test('has required fields', () => {
        const pc: PersonaCredential = {
            personaId: 'persona-001',
            role: 'auditor',
            credential: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential', 'PersonaCredential'],
                issuer: 'did:hedera:testnet:0.0.100',
                issuanceDate: '2024-01-15T10:00:00Z',
                credentialSubject: { role: 'auditor' },
            },
        };
        expect(pc.personaId).toBe('persona-001');
        expect(pc.role).toBe('auditor');
        expect(pc.credential.type).toContain('PersonaCredential');
    });

    test('organizationId is optional', () => {
        const pc: PersonaCredential = {
            personaId: 'persona-002',
            role: 'inspector',
            credential: {
                '@context': [],
                type: [],
                issuer: '',
                issuanceDate: '',
                credentialSubject: {},
            },
        };
        expect(pc.organizationId).toBeUndefined();
    });

    test('includes organizationId when present', () => {
        const pc: PersonaCredential = {
            personaId: 'persona-003',
            role: 'verifier',
            organizationId: 'ORG-001',
            credential: {
                '@context': [],
                type: [],
                issuer: '',
                issuanceDate: '',
                credentialSubject: {},
            },
        };
        expect(pc.organizationId).toBe('ORG-001');
    });
});

describe('Policy', () => {
    test('has required fields', () => {
        const policy: Policy = {
            policyId: 'POL-001',
            name: 'Biochar Certification Policy',
            version: '1.0.0',
            status: 'DRAFT',
        };
        expect(policy.policyId).toBe('POL-001');
        expect(policy.name).toBe('Biochar Certification Policy');
        expect(policy.version).toBe('1.0.0');
        expect(policy.status).toBe('DRAFT');
    });

    test('status covers all 4 values', () => {
        const statuses: Policy['status'][] = ['DRAFT', 'DRY_RUN', 'PUBLISHED', 'DISCONTINUED'];
        expect(statuses).toHaveLength(4);
        statuses.forEach((s) => expect(typeof s).toBe('string'));
    });

    test('optional fields work', () => {
        const policy: Policy = {
            policyId: 'POL-002',
            name: 'Carbon Credit Policy',
            version: '2.1.0',
            status: 'PUBLISHED',
            description: 'Policy for issuing carbon credits',
            topicId: '0.0.500',
        };
        expect(policy.description).toBe('Policy for issuing carbon credits');
        expect(policy.topicId).toBe('0.0.500');
    });
});

describe('GuardianConfig', () => {
    test('extends HederaConfig with optional guardian fields', () => {
        const config: GuardianConfig = {
            network: 'testnet',
            operatorAccountId: '0.0.1001',
            operatorPrivateKey: '302e020100300506032b657004220420aaaa',
            supplyKey: '302e020100300506032b657004220420bbbb',
        };
        expect(config.guardianApiUrl).toBeUndefined();
        expect(config.guardianAccessToken).toBeUndefined();
    });

    test('includes guardian-specific fields when present', () => {
        const config: GuardianConfig = {
            network: 'testnet',
            operatorAccountId: '0.0.1001',
            operatorPrivateKey: '302e020100300506032b657004220420aaaa',
            supplyKey: '302e020100300506032b657004220420bbbb',
            guardianApiUrl: 'https://guardian.example.com/api',
            guardianAccessToken: 'bearer-token-123',
        };
        expect(config.guardianApiUrl).toBe('https://guardian.example.com/api');
        expect(config.guardianAccessToken).toBe('bearer-token-123');
    });

    test('inherits HederaConfig fields', () => {
        const config: GuardianConfig = {
            network: 'mainnet',
            operatorAccountId: '0.0.2001',
            operatorPrivateKey: '302e020100300506032b657004220420bbbb',
            supplyKey: '302e020100300506032b657004220420cccc',
            mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
        };
        expect(config.network).toBe('mainnet');
        expect(config.supplyKey).toBe('302e020100300506032b657004220420cccc');
        expect(config.mirrorNodeUrl).toBe('https://mainnet.mirrornode.hedera.com');
    });
});
