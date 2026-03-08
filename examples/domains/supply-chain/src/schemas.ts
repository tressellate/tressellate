/**
 * Supply Chain domain schemas.
 * Compose Layer 3 asset type patterns with supply chain-specific fields.
 */

import type { MaterialType, QualityGrade } from './enums.js';

/** Parts provenance record metadata (composes Provenance). */
export interface PartsProvenanceSchema {
    type: 'PARTS_PROVENANCE';
    partNumber: string;
    batchId: string;
    materialType: MaterialType;
    supplierId: string;
    manufacturingDate: string;
    facilityId: string;
    originCountry: string;
    recordedAt: string;
}

/** Quality certification metadata (composes Certificate). */
export interface QualityCertSchema {
    type: 'QUALITY_CERT';
    partNumber: string;
    batchRef: string;
    qualityGrade: QualityGrade;
    testResults?: {
        tensileStrength?: number;
        hardness?: number;
        tolerance?: number;
    };
    inspectorId: string;
    certifiedAt: string;
}
