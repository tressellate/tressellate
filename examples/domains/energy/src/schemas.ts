/**
 * Energy domain schemas.
 * Compose Layer 3 asset type patterns with energy-specific fields.
 */

import type { EnergySource, VerificationBody } from './enums.js';

/** Renewable Energy Credit audit record (composes Credit). */
export interface RECCreditSchema {
    event: 'REC_CREDITS_MINTED';
    schema: 'REC_CREDIT';
    generatorId: string;
    energySource: EnergySource;
    mwhGenerated: number;
    vintage: number;
    verificationBody: VerificationBody;
    tokenId: string;
    mintTxId: string;
    issuedAt: string;
}

/** Generation certificate metadata (composes Certificate). */
export interface GenerationCertSchema {
    type: 'GENERATION_CERT';
    facilityId: string;
    energySource: EnergySource;
    capacityKw: number;
    meterReadingStart: number;
    meterReadingEnd: number;
    periodStart: string;
    periodEnd: string;
    certifiedAt: string;
}
