import type { AssetReference } from '../types.js';

/**
 * Claim — A verifiable assertion that triggers a verification workflow.
 *
 * A Claim is the bridge between off-chain reality and on-chain verification.
 * It represents "I assert X happened" and initiates the process of confirming
 * or rejecting that assertion.
 *
 * Ledger mapping: NFT (unique claim record — persists regardless of outcome)
 * Lifecycle: SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED | WITHDRAWN
 */
export interface ClaimSchema {
    /** Who is making the assertion. */
    claimantId: string;
    /** Category of claim (emission, delivery, completion, etc.). */
    claimType: string;
    /** Structured description of what is claimed. */
    assertion: Record<string, unknown>;
    /** Supporting evidence for the claim. */
    evidence?: AssetReference[];
    /** When the claim was made (ISO-8601). */
    submittedAt: string;
    /** Which Layer 2 policy governs verification. */
    verificationPolicy?: string;
    /** Assets created if claim is verified. */
    resultingAssets?: AssetReference[];
}
