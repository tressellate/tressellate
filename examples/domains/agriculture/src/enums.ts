/**
 * Agriculture domain enums.
 */

/** Crop category for yield certification. */
export const CropCategory = [
    'GRAIN',
    'VEGETABLE',
    'FRUIT',
    'LEGUME',
    'ROOT',
    'OTHER',
] as const;
export type CropCategory = (typeof CropCategory)[number];

/** Certification standard for crop yields. */
export const CertificationStandard = [
    'USDA_ORGANIC',
    'EU_ORGANIC',
    'GAP',
    'RAINFOREST_ALLIANCE',
    'INTERNAL',
] as const;
export type CertificationStandard = (typeof CertificationStandard)[number];

/** Schema type identifiers for Agriculture NFTs. */
export const AgricultureSchemaType = [
    'CROP_YIELD_CERT',
    'SOIL_INSPECTION',
] as const;
export type AgricultureSchemaType = (typeof AgricultureSchemaType)[number];
