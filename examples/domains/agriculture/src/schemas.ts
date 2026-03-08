/**
 * Agriculture domain schemas.
 * Compose Layer 3 asset type patterns with agriculture-specific fields.
 */

import type { CropCategory, CertificationStandard } from './enums.js';

/** Crop yield certificate metadata (composes Certificate). */
export interface CropYieldCertSchema {
    type: 'CROP_YIELD_CERT';
    farmId: string;
    fieldId: string;
    cropCategory: CropCategory;
    variety: string;
    yieldKg: number;
    harvestDate: string;
    certificationStandard: CertificationStandard;
    inspectionRef?: string;
    certifiedAt: string;
}

/** Soil inspection record metadata (composes Inspection). */
export interface SoilInspectionSchema {
    type: 'SOIL_INSPECTION';
    farmId: string;
    fieldId: string;
    ph: number;
    organicMatter: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    inspectedAt: string;
    inspectorId: string;
}
