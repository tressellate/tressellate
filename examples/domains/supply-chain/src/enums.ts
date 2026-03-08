/**
 * Supply Chain domain enums.
 */

/** Material type for manufactured parts. */
export const MaterialType = [
    'STEEL',
    'ALUMINUM',
    'PLASTIC',
    'COMPOSITE',
    'ELECTRONIC',
    'OTHER',
] as const;
export type MaterialType = (typeof MaterialType)[number];

/** Quality grade for parts certification. */
export const QualityGrade = [
    'A',
    'B',
    'C',
    'REJECTED',
] as const;
export type QualityGrade = (typeof QualityGrade)[number];

/** Schema type identifiers for Supply Chain NFTs. */
export const SupplyChainSchemaType = [
    'PARTS_PROVENANCE',
    'QUALITY_CERT',
] as const;
export type SupplyChainSchemaType = (typeof SupplyChainSchemaType)[number];
