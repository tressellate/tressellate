/**
 * Agreement — A multi-party commitment with defined terms, parties,
 * and enforcement conditions.
 *
 * Ledger mapping: NFT (unique agreement per set of parties)
 * Lifecycle: DRAFT → PENDING_SIGNATURES → ACTIVE → EXPIRED | TERMINATED | REVOKED
 */

export interface PartyInfo {
    /** Party account identifier. */
    accountId: string;
    /** Party role in the agreement. */
    role: string;
}

export interface AgreementCondition {
    /** Condition identifier. */
    conditionId: string;
    /** Condition description. */
    description: string;
    /** Whether the condition has been met. */
    met?: boolean;
}

export interface AgreementSchema {
    /** Signers and their roles. */
    parties?: PartyInfo[];
    /** Hash of the agreement text. */
    termsHash: string;
    /** When the agreement begins (ISO-8601). */
    effectiveDate?: string;
    /** When the agreement ends (ISO-8601). */
    expirationDate?: string;
    /** Conditions for activation/termination. */
    conditions?: AgreementCondition[];
    /** What the agreement covers. */
    scope?: string;
}
