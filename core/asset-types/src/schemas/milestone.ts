import type { AssetReference } from '../types.js';

/**
 * Milestone — A verifiable marker of progress within a larger process or project.
 *
 * Ledger mapping: NFT (unique milestone record)
 * Lifecycle: PENDING → COMPLETED → VERIFIED
 */
export interface MilestoneSchema {
    /** Which project/process. */
    projectId: string;
    /** Sequence position. */
    milestoneIndex?: number;
    /** What was achieved. */
    description?: string;
    /** Proof of completion. */
    evidence?: AssetReference[];
    /** When the milestone was completed (ISO-8601). */
    completedAt: string;
    /** Prerequisite milestones. */
    dependencies?: AssetReference[];
}
