/**
 * Layer 3 — Common types for asset type schemas and operations.
 *
 * These types are domain-ignorant. They define structural patterns
 * that Layer 4 domains compose with domain-specific fields.
 */

/** A reference to another on-chain asset (NFT serial, token ID, topic message). */
export interface AssetReference {
    /** The asset type being referenced (e.g. 'Certificate', 'Provenance'). */
    assetType: string;
    /** Token/collection ID on the ledger. */
    tokenId: string;
    /** Serial number for NFT references, or null for fungible tokens. */
    serialNumber?: number;
    /** Optional human-readable label. */
    label?: string;
}

/** The 7 base asset type identifiers. */
export type AssetType =
    | 'Certificate'
    | 'Provenance'
    | 'Credit'
    | 'Agreement'
    | 'Inspection'
    | 'Milestone'
    | 'Claim';

/** Ledger primitive used by the asset. */
export type LedgerMapping = 'NFT' | 'FungibleToken';

/** Result of an asset mint operation (NFT or fungible token). */
export interface AssetOperationResult {
    /** Whether the operation succeeded. */
    success: boolean;
    /** The schema type name (domain-specific, e.g. 'TERRAPRIMACERT'). */
    schemaType: string;
    /** The underlying asset type (Layer 3). */
    assetType: AssetType;
    /** NFT serial number (for NFT assets) or mint amount (for tokens). */
    serialNumber?: number;
    amount?: number;
    /** Ledger transaction ID. */
    transactionId?: string;
    /** Collection/token ID on the ledger. */
    tokenId: string;
    /** Audit trail consensus timestamp, if audit was submitted. */
    auditTimestamp?: string | null;
    /** The full metadata that was written to the ledger. */
    metadata?: Record<string, unknown>;
}

/** Query parameters for audit trail retrieval. */
export interface AuditTrailQuery {
    /** Filter by schema type (e.g. 'BATCHCERT', 'BIOCHARPROV'). */
    schemaType?: string;
    /** Maximum number of messages to return. */
    limit?: number;
    /** Sort order. */
    order?: 'asc' | 'desc';
}

/** A single audit trail message. */
export interface AuditTrailMessage {
    /** Consensus timestamp from HCS. */
    consensusTimestamp: string;
    /** The parsed message content. */
    message: Record<string, unknown>;
    /** Sequence number within the topic. */
    sequenceNumber: number;
}

/** Result of an audit trail query. */
export interface AuditTrailResult {
    /** The topic ID queried. */
    topicId: string;
    /** Matched messages. */
    messages: AuditTrailMessage[];
    /** Total messages returned. */
    count: number;
}
