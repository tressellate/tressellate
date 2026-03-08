import { describe, test, expect } from 'bun:test';
import type {
	GovernanceProvider,
	ProviderCapabilities,
	VerificationResult,
	PersonaResolution
} from '../governance-provider.js';
import { NoopGovernanceProvider } from '../providers/noop.js';

describe('GovernanceProvider interface', () => {
	test('NoopGovernanceProvider implements GovernanceProvider', () => {
		const provider: GovernanceProvider = new NoopGovernanceProvider();
		expect(provider.name).toBe('Noop');
		expect(typeof provider.resolvePersona).toBe('function');
		expect(typeof provider.isAuthorized).toBe('function');
	});

	test('NoopGovernanceProvider reports no capabilities', () => {
		const provider = new NoopGovernanceProvider();
		const caps = provider.capabilities;
		expect(caps.verifiableCredentials).toBe(false);
		expect(caps.policyManagement).toBe(false);
		expect(caps.personaResolution).toBe(false);
		expect(caps.crossDomainReferences).toBe(false);
		expect(caps.dmrvWorkflows).toBe(false);
	});

	test('NoopGovernanceProvider authorizes all operations', async () => {
		const provider = new NoopGovernanceProvider();
		const result = await provider.isAuthorized('0.0.12345', 'mint_certificate');
		expect(result).toBe(true);
	});

	test('NoopGovernanceProvider authorizes with context', async () => {
		const provider = new NoopGovernanceProvider();
		const result = await provider.isAuthorized(
			'0.0.12345',
			'revoke_certificate',
			{ domain: 'agriculture', reason: 'expired' }
		);
		expect(result).toBe(true);
	});

	test('NoopGovernanceProvider resolves all personas', async () => {
		const provider = new NoopGovernanceProvider();
		const resolution = await provider.resolvePersona(
			'0.0.12345',
			'CertifiedInspector',
			'agriculture'
		);
		expect(resolution.authorized).toBe(true);
		expect(resolution.reason).toContain('development mode');
	});

	test('NoopGovernanceProvider does not have optional methods', () => {
		const provider = new NoopGovernanceProvider();
		expect(provider.issueCredential).toBeUndefined();
		expect(provider.verifyCredential).toBeUndefined();
		expect(provider.listPolicies).toBeUndefined();
		expect(provider.getPolicy).toBeUndefined();
	});
});

describe('ProviderCapabilities type', () => {
	test('all capability flags are boolean', () => {
		const caps: ProviderCapabilities = {
			verifiableCredentials: true,
			policyManagement: true,
			personaResolution: true,
			crossDomainReferences: false,
			dmrvWorkflows: false
		};
		expect(typeof caps.verifiableCredentials).toBe('boolean');
		expect(typeof caps.policyManagement).toBe('boolean');
		expect(typeof caps.personaResolution).toBe('boolean');
		expect(typeof caps.crossDomainReferences).toBe('boolean');
		expect(typeof caps.dmrvWorkflows).toBe('boolean');
	});
});

describe('VerificationResult type', () => {
	test('minimal result has valid and verifiedAt', () => {
		const result: VerificationResult = {
			valid: true,
			verifiedAt: '2026-03-07T10:00:00Z'
		};
		expect(result.valid).toBe(true);
		expect(result.reason).toBeUndefined();
		expect(result.trustChain).toBeUndefined();
	});

	test('failed result includes reason', () => {
		const result: VerificationResult = {
			valid: false,
			reason: 'Credential expired',
			verifiedAt: '2026-03-07T10:00:00Z'
		};
		expect(result.valid).toBe(false);
		expect(result.reason).toBe('Credential expired');
	});

	test('successful result includes trust chain', () => {
		const result: VerificationResult = {
			valid: true,
			trustChain: ['did:hedera:0.0.100', 'did:hedera:0.0.50', 'did:hedera:0.0.1'],
			verifiedAt: '2026-03-07T10:00:00Z'
		};
		expect(result.trustChain).toHaveLength(3);
	});
});

describe('PersonaResolution type', () => {
	test('authorized resolution', () => {
		const resolution: PersonaResolution = {
			authorized: true,
			credential: {
				personaId: 'persona-001',
				role: 'inspector',
				credential: {
					'@context': ['https://www.w3.org/2018/credentials/v1'],
					type: ['VerifiableCredential'],
					issuer: 'did:hedera:testnet:0.0.100',
					issuanceDate: '2026-01-15T10:00:00Z',
					credentialSubject: { role: 'inspector' }
				}
			}
		};
		expect(resolution.authorized).toBe(true);
		expect(resolution.credential?.role).toBe('inspector');
	});

	test('unauthorized resolution includes reason', () => {
		const resolution: PersonaResolution = {
			authorized: false,
			reason: 'Account does not hold CertifiedInspector credential'
		};
		expect(resolution.authorized).toBe(false);
		expect(resolution.reason).toContain('CertifiedInspector');
		expect(resolution.credential).toBeUndefined();
	});
});

describe('Custom GovernanceProvider implementation', () => {
	test('can implement a minimal RBAC provider', async () => {
		const authorizedRoles = new Map<string, string[]>();
		authorizedRoles.set('0.0.100', ['admin', 'inspector']);
		authorizedRoles.set('0.0.200', ['viewer']);

		const rbacProvider: GovernanceProvider = {
			name: 'SimpleRBAC',
			capabilities: {
				verifiableCredentials: false,
				policyManagement: false,
				personaResolution: true,
				crossDomainReferences: false,
				dmrvWorkflows: false
			},
			async resolvePersona(accountId, requiredRole) {
				const roles = authorizedRoles.get(accountId) ?? [];
				return {
					authorized: roles.includes(requiredRole),
					reason: roles.includes(requiredRole)
						? undefined
						: `Account ${accountId} does not have role ${requiredRole}`
				};
			},
			async isAuthorized(accountId, operation, context) {
				const roles = authorizedRoles.get(accountId) ?? [];
				return roles.includes('admin') || roles.length > 0;
			}
		};

		expect(rbacProvider.name).toBe('SimpleRBAC');
		expect(rbacProvider.capabilities.personaResolution).toBe(true);

		const adminResult = await rbacProvider.resolvePersona('0.0.100', 'inspector');
		expect(adminResult.authorized).toBe(true);

		const viewerResult = await rbacProvider.resolvePersona('0.0.200', 'inspector');
		expect(viewerResult.authorized).toBe(false);
		expect(viewerResult.reason).toContain('does not have role');

		const unknownResult = await rbacProvider.resolvePersona('0.0.999', 'admin');
		expect(unknownResult.authorized).toBe(false);

		expect(await rbacProvider.isAuthorized('0.0.100', 'any_operation')).toBe(true);
		expect(await rbacProvider.isAuthorized('0.0.999', 'any_operation')).toBe(false);
	});
});
