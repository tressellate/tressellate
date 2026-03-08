/**
 * Healthcare domain schemas.
 * Compose Layer 3 asset type patterns with healthcare-specific fields.
 */

import type { DrugClassification, StorageCondition } from './enums.js';

/** Drug lot certification metadata (composes Certificate). */
export interface DrugLotCertSchema {
    type: 'DRUG_LOT_CERT';
    lotNumber: string;
    ndc: string;
    drugName: string;
    classification: DrugClassification;
    manufacturer: string;
    dosageForm: string;
    strength: string;
    expirationDate: string;
    certifiedAt: string;
    gmpCompliant: boolean;
}

/** Supply chain custody step metadata (composes Provenance). */
export interface SupplyChainStepSchema {
    type: 'SUPPLY_CHAIN_STEP';
    lotRef: string;
    fromFacility: string;
    toFacility: string;
    storageCondition: StorageCondition;
    tempMin: number;
    tempMax: number;
    shippedAt: string;
    receivedAt?: string;
    custodyChain: string[];
}
