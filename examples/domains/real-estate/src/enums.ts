/**
 * Real Estate domain enums.
 */

/** Property type classification. */
export const PropertyType = [
    'RESIDENTIAL',
    'COMMERCIAL',
    'INDUSTRIAL',
    'LAND',
    'MIXED_USE',
] as const;
export type PropertyType = (typeof PropertyType)[number];

/** Lease lifecycle status. */
export const LeaseStatus = [
    'DRAFT',
    'ACTIVE',
    'EXPIRED',
    'TERMINATED',
] as const;
export type LeaseStatus = (typeof LeaseStatus)[number];

/** Schema type identifiers for Real Estate NFTs. */
export const RealEstateSchemaType = [
    'LEASE_AGREEMENT',
    'PAYMENT_MILESTONE',
] as const;
export type RealEstateSchemaType = (typeof RealEstateSchemaType)[number];
