/**
 * Healthcare domain enums.
 */

/** Drug regulatory classification. */
export const DrugClassification = [
    'OTC',
    'PRESCRIPTION',
    'CONTROLLED',
    'BIOLOGIC',
] as const;
export type DrugClassification = (typeof DrugClassification)[number];

/** Storage condition requirements. */
export const StorageCondition = [
    'ROOM_TEMP',
    'REFRIGERATED',
    'FROZEN',
    'CONTROLLED_SUBSTANCE',
] as const;
export type StorageCondition = (typeof StorageCondition)[number];

/** Schema type identifiers for Healthcare NFTs. */
export const HealthcareSchemaType = [
    'DRUG_LOT_CERT',
    'SUPPLY_CHAIN_STEP',
] as const;
export type HealthcareSchemaType = (typeof HealthcareSchemaType)[number];
