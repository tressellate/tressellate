/**
 * Guardian credential and governance types.
 * Stubs — will be refined when Guardian integration is implemented.
 */

/** A W3C Verifiable Credential issued by Guardian. */
export interface VerifiableCredential {
    '@context': string[];
    type: string[];
    issuer: string;
    issuanceDate: string;
    credentialSubject: Record<string, unknown>;
    proof?: Record<string, unknown>;
}

/** A persona credential binding an identity to a role. */
export interface PersonaCredential {
    personaId: string;
    role: string;
    organizationId?: string;
    credential: VerifiableCredential;
}

/** A Guardian policy definition. */
export interface Policy {
    policyId: string;
    name: string;
    description?: string;
    version: string;
    status: 'DRAFT' | 'DRY_RUN' | 'PUBLISHED' | 'DISCONTINUED';
    topicId?: string;
}
