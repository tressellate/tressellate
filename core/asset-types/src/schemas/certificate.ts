import type { AssetReference } from '../types.js';

/**
 * Certificate — A verifiable attestation that something meets a defined standard.
 *
 * Ledger mapping: NFT (unique, non-fungible)
 * Lifecycle: DRAFT → ISSUED → ACTIVE → EXPIRED | REVOKED
 */
export interface CertificateSchema {
    /** Hash of the certified content. */
    contentHash?: string;
    /** Who issued the certificate. */
    issuerId?: string;
    /** What is being certified. */
    subjectId?: string;
    /** When the certificate was issued (ISO-8601). */
    issuedAt: string;
    /** Optional expiration (ISO-8601). */
    expiresAt?: string;
    /** Which standard it certifies against. */
    standard?: string;
    /** Supporting evidence references. */
    evidence?: AssetReference[];
}
