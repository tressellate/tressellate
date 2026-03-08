/**
 * NoopGovernanceProvider — pass-through provider for development and testing.
 *
 * Authorizes all operations, resolves all personas as authorized,
 * and reports no capabilities beyond the minimum. Use this when
 * developing Layer 4/5 packages without a governance backend.
 */

import type {
	GovernanceProvider,
	ProviderCapabilities,
	PersonaResolution
} from '../governance-provider.js';

export class NoopGovernanceProvider implements GovernanceProvider {
	readonly name = 'Noop';

	readonly capabilities: ProviderCapabilities = {
		verifiableCredentials: false,
		policyManagement: false,
		personaResolution: false,
		crossDomainReferences: false,
		dmrvWorkflows: false
	};

	async resolvePersona(
		_accountId: string,
		_requiredRole: string,
		_domain?: string
	): Promise<PersonaResolution> {
		return {
			authorized: true,
			reason: 'NoopGovernanceProvider: all personas authorized in development mode'
		};
	}

	async isAuthorized(
		_accountId: string,
		_operation: string,
		_context?: Record<string, unknown>
	): Promise<boolean> {
		return true;
	}
}
