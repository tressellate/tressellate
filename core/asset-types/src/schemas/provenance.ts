import type { AssetReference } from '../types.js';

/**
 * Provenance Record — An immutable record of origin, chain of custody,
 * or transformation history.
 *
 * Ledger mapping: NFT (unique provenance record per source/batch)
 * Lifecycle: RECORDED → VERIFIED → SUPERSEDED
 */
export interface ProvenanceSchema {
    /** Origin identifier. */
    sourceId?: string;
    /** Type of source (mine, farm, lab, etc.). */
    sourceType?: string;
    /** Material/data composition details. */
    composition?: Record<string, unknown>;
    /** Geographic origin. */
    location?: Record<string, unknown>;
    /** When provenance was established (ISO-8601). */
    timestamp: string;
    /** Upstream provenance links. */
    parentRecords?: AssetReference[];
    /** Processing/transformation steps. */
    transformations?: Record<string, unknown>[];
}
