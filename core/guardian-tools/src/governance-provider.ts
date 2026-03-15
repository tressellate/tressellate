/**
 * GovernanceProvider — pluggable interface for Layer 2 governance.
 *
 * Guardian is the full-featured implementation (DIDs, VCs, policies, dMRV).
 * Lightweight providers (e.g., Smart Contract RBAC) can implement the subset
 * they support, allowing teams to adopt Tressellate (L1, L3, L4, L5) without
 * the operational overhead of deploying Guardian.
 *
 * Design principle: Layer 4 domains depend on this interface, not on
 * Guardian directly. This keeps governance swappable without touching
 * domain or application code.
 */

import type { VerifiableCredential, PersonaCredential, Policy } from './types.js';

/** Result of a credential verification check. */
export interface VerificationResult {
	valid: boolean;
	/** Why verification failed, if applicable. */
	reason?: string;
	/** The trust chain from credential to root authority. */
	trustChain?: string[];
	/** Timestamp of verification. */
	verifiedAt: string;
}

/** Result of a persona resolution. */
export interface PersonaResolution {
	/** Whether the account holds the required persona. */
	authorized: boolean;
	/** The matched credential, if found. */
	credential?: PersonaCredential;
	/** Why resolution failed, if applicable. */
	reason?: string;
}

/** Describes a provider's capability support level. */
export interface ProviderCapabilities {
	/** Full VC lifecycle (issue, verify, revoke). */
	verifiableCredentials: boolean;
	/** Policy creation and management. */
	policyManagement: boolean;
	/** Cross-domain persona resolution. */
	personaResolution: boolean;
	/** Cross-domain reference resolution. */
	crossDomainReferences: boolean;
	/** dMRV workflow execution. */
	dmrvWorkflows: boolean;
}

/**
 * Abstract governance interface.
 *
 * Implementations:
 * - `GuardianGovernanceProvider` — full Guardian API (VCs, policies, dMRV)
 * - `RBACGovernanceProvider`     — lightweight Smart Contract RBAC (roles only)
 * - `NoopGovernanceProvider`     — pass-through for development/testing
 */
export interface GovernanceProvider {
	/** Human-readable provider name (e.g., "Guardian", "SmartContractRBAC"). */
	readonly name: string;

	/** What this provider supports. Callers check before invoking optional methods. */
	readonly capabilities: ProviderCapabilities;

	// ── Credential Lifecycle ──────────────────────────────────────────

	/**
	 * Issue a Verifiable Credential.
	 * Requires: `capabilities.verifiableCredentials`
	 */
	issueCredential?(
		subjectId: string,
		claims: Record<string, unknown>,
		policyId?: string
	): Promise<VerifiableCredential>;

	/**
	 * Verify a Verifiable Credential.
	 * Requires: `capabilities.verifiableCredentials`
	 */
	verifyCredential?(credential: VerifiableCredential): Promise<VerificationResult>;

	// ── Persona Resolution ────────────────────────────────────────────

	/**
	 * Resolve whether an account holds a specific persona (role credential).
	 * All providers should implement this — it's the minimum governance check.
	 */
	resolvePersona(
		accountId: string,
		requiredRole: string,
		domain?: string
	): Promise<PersonaResolution>;

	// ── Policy Management ─────────────────────────────────────────────

	/**
	 * List available governance policies.
	 * Requires: `capabilities.policyManagement`
	 */
	listPolicies?(): Promise<Policy[]>;

	/**
	 * Get a specific policy by ID.
	 * Requires: `capabilities.policyManagement`
	 */
	getPolicy?(policyId: string): Promise<Policy | null>;

	// ── Authorization Check ───────────────────────────────────────────

	/**
	 * Check whether an account is authorized to perform an operation.
	 * This is the core governance gate used by Layer 3/4/5.
	 *
	 * All providers MUST implement this method.
	 */
	isAuthorized(
		accountId: string,
		operation: string,
		context?: Record<string, unknown>
	): Promise<boolean>;
}
