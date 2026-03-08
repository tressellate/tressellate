/**
 * Energy domain enums.
 */

/** Renewable energy generation source. */
export const EnergySource = [
    'SOLAR',
    'WIND',
    'HYDRO',
    'GEOTHERMAL',
    'BIOMASS',
] as const;
export type EnergySource = (typeof EnergySource)[number];

/** REC verification body. */
export const VerificationBody = [
    'GREEN_E',
    'I_REC',
    'GO_EU',
    'INTERNAL',
] as const;
export type VerificationBody = (typeof VerificationBody)[number];

/** Schema type identifiers for Energy NFTs/tokens. */
export const EnergySchemaType = [
    'REC_CREDIT',
    'GENERATION_CERT',
] as const;
export type EnergySchemaType = (typeof EnergySchemaType)[number];
