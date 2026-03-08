import type { AssetReference } from '../types.js';

/**
 * Inspection Record — A time-stamped observation or assessment
 * by an authorized inspector.
 *
 * Ledger mapping: NFT (unique inspection record)
 * Lifecycle: SUBMITTED → REVIEWED → ACCEPTED | DISPUTED
 */

export type InspectionResult = 'PASS' | 'FAIL' | 'CONDITIONAL';

export interface InspectionSchema {
    /** Who performed the inspection. */
    inspectorId?: string;
    /** What was inspected. */
    subjectId?: string;
    /** Category of inspection. */
    inspectionType?: string;
    /** Structured results. */
    findings?: Record<string, unknown>;
    /** Overall result. */
    result?: InspectionResult;
    /** Conditions for CONDITIONAL result. */
    conditions?: string[];
    /** Supporting evidence (photos, measurements, etc.). */
    evidence?: AssetReference[];
    /** When the inspection occurred (ISO-8601). */
    timestamp: string;
}
