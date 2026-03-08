import type { AssetReference } from '../types.js';

/**
 * Credit / Currency — A fungible, divisible unit of value representing
 * a measurable quantity.
 *
 * Ledger mapping: Fungible Token (HTS)
 * Lifecycle: MINTED → CIRCULATING → REDEEMED | BURNED
 */
export interface CreditSchema {
    /** What one unit represents (tCO2, room-night, etc.). */
    unit?: string;
    /** Divisibility (typically 2 for currency, 0 for whole units). */
    decimals?: number;
    /** What underlies the value. */
    backingEvidence?: AssetReference[];
    /** Guardian policy governing issuance. */
    issuancePolicy?: string;
}
