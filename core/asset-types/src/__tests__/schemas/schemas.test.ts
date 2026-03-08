import { describe, test, expect } from 'bun:test';
import type {
    CertificateSchema,
    ProvenanceSchema,
    CreditSchema,
    AgreementSchema,
    PartyInfo,
    AgreementCondition,
    InspectionSchema,
    InspectionResult,
    MilestoneSchema,
    ClaimSchema,
} from '../../schemas/index.js';
import type { AssetReference } from '../../types.js';

describe('CertificateSchema', () => {
    test('satisfies required fields', () => {
        const cert: CertificateSchema = {
            issuedAt: '2024-01-15T10:00:00Z',
        };
        expect(cert.issuedAt).toBe('2024-01-15T10:00:00Z');
    });

    test('includes optional fields', () => {
        const cert: CertificateSchema = {
            issuedAt: '2024-01-15T10:00:00Z',
            contentHash: 'sha256:abc123',
            issuerId: '0.0.100',
            subjectId: '0.0.200',
            expiresAt: '2025-01-15T10:00:00Z',
            standard: 'ISO-14064',
            evidence: [{ assetType: 'Inspection', tokenId: '0.0.300', serialNumber: 1 }],
        };
        expect(cert.contentHash).toBe('sha256:abc123');
        expect(cert.standard).toBe('ISO-14064');
        expect(cert.evidence).toHaveLength(1);
    });
});

describe('ProvenanceSchema', () => {
    test('satisfies required fields', () => {
        const prov: ProvenanceSchema = {
            timestamp: '2024-01-15T10:00:00Z',
        };
        expect(prov.timestamp).toBe('2024-01-15T10:00:00Z');
    });

    test('includes optional fields', () => {
        const prov: ProvenanceSchema = {
            timestamp: '2024-01-15T10:00:00Z',
            sourceId: 'FARM-001',
            sourceType: 'farm',
            composition: { material: 'biochar', percentage: 95 },
            location: { lat: 14.5, lng: 121.0 },
            parentRecords: [{ assetType: 'Provenance', tokenId: '0.0.100' }],
            transformations: [{ type: 'pyrolysis', temperature: 600 }],
        };
        expect(prov.sourceId).toBe('FARM-001');
        expect(prov.composition?.material).toBe('biochar');
        expect(prov.transformations).toHaveLength(1);
    });
});

describe('CreditSchema', () => {
    test('all fields optional', () => {
        const credit: CreditSchema = {};
        expect(credit.unit).toBeUndefined();
    });

    test('includes optional fields', () => {
        const credit: CreditSchema = {
            unit: 'tCO2',
            decimals: 2,
            backingEvidence: [{ assetType: 'Certificate', tokenId: '0.0.100' }],
            issuancePolicy: 'VERRA-001',
        };
        expect(credit.unit).toBe('tCO2');
        expect(credit.decimals).toBe(2);
    });
});

describe('AgreementSchema', () => {
    test('satisfies required fields', () => {
        const agreement: AgreementSchema = {
            termsHash: 'sha256:terms123',
        };
        expect(agreement.termsHash).toBe('sha256:terms123');
    });

    test('includes parties and conditions', () => {
        const party: PartyInfo = { accountId: '0.0.100', role: 'buyer' };
        const condition: AgreementCondition = {
            conditionId: 'C1',
            description: 'Payment received',
            met: false,
        };
        const agreement: AgreementSchema = {
            termsHash: 'sha256:terms123',
            parties: [party, { accountId: '0.0.200', role: 'seller' }],
            effectiveDate: '2024-01-01',
            expirationDate: '2025-01-01',
            conditions: [condition],
            scope: 'NDA',
        };
        expect(agreement.parties).toHaveLength(2);
        expect(agreement.conditions?.[0].met).toBe(false);
        expect(agreement.scope).toBe('NDA');
    });
});

describe('PartyInfo', () => {
    test('has required fields', () => {
        const party: PartyInfo = { accountId: '0.0.100', role: 'inspector' };
        expect(party.accountId).toBe('0.0.100');
        expect(party.role).toBe('inspector');
    });
});

describe('AgreementCondition', () => {
    test('has required fields', () => {
        const cond: AgreementCondition = {
            conditionId: 'C1',
            description: 'Inspection passed',
        };
        expect(cond.conditionId).toBe('C1');
        expect(cond.description).toBe('Inspection passed');
        expect(cond.met).toBeUndefined();
    });
});

describe('InspectionSchema', () => {
    test('satisfies required fields', () => {
        const inspection: InspectionSchema = {
            timestamp: '2024-02-01T14:30:00Z',
        };
        expect(inspection.timestamp).toBe('2024-02-01T14:30:00Z');
    });

    test('includes result and findings', () => {
        const inspection: InspectionSchema = {
            timestamp: '2024-02-01T14:30:00Z',
            inspectorId: '0.0.150',
            subjectId: 'BATCH-001',
            inspectionType: 'quality',
            findings: { moisture: 12, carbonContent: 85 },
            result: 'PASS',
            conditions: [],
            evidence: [{ assetType: 'Certificate', tokenId: '0.0.100' }],
        };
        expect(inspection.result).toBe('PASS');
        expect(inspection.findings?.moisture).toBe(12);
    });

    test('InspectionResult covers all values', () => {
        const results: InspectionResult[] = ['PASS', 'FAIL', 'CONDITIONAL'];
        expect(results).toHaveLength(3);
    });
});

describe('MilestoneSchema', () => {
    test('satisfies required fields', () => {
        const milestone: MilestoneSchema = {
            projectId: 'PROJ-001',
            completedAt: '2024-03-15T12:00:00Z',
        };
        expect(milestone.projectId).toBe('PROJ-001');
        expect(milestone.completedAt).toBe('2024-03-15T12:00:00Z');
    });

    test('includes optional fields', () => {
        const milestone: MilestoneSchema = {
            projectId: 'PROJ-001',
            completedAt: '2024-03-15T12:00:00Z',
            milestoneIndex: 3,
            description: 'Phase 3 complete',
            evidence: [{ assetType: 'Inspection', tokenId: '0.0.100' }],
            dependencies: [{ assetType: 'Milestone', tokenId: '0.0.100', serialNumber: 2 }],
        };
        expect(milestone.milestoneIndex).toBe(3);
        expect(milestone.dependencies).toHaveLength(1);
    });
});

describe('ClaimSchema', () => {
    test('satisfies required fields', () => {
        const claim: ClaimSchema = {
            claimantId: '0.0.100',
            claimType: 'emission_reduction',
            assertion: { reduction: 500, unit: 'tCO2' },
            submittedAt: '2024-04-01T09:00:00Z',
        };
        expect(claim.claimantId).toBe('0.0.100');
        expect(claim.claimType).toBe('emission_reduction');
        expect(claim.assertion.reduction).toBe(500);
        expect(claim.submittedAt).toBe('2024-04-01T09:00:00Z');
    });

    test('includes optional fields', () => {
        const claim: ClaimSchema = {
            claimantId: '0.0.100',
            claimType: 'delivery',
            assertion: { delivered: true },
            submittedAt: '2024-04-01T09:00:00Z',
            evidence: [{ assetType: 'Inspection', tokenId: '0.0.300' }],
            verificationPolicy: 'POLICY-001',
            resultingAssets: [{ assetType: 'Credit', tokenId: '0.0.400' }],
        };
        expect(claim.verificationPolicy).toBe('POLICY-001');
        expect(claim.resultingAssets).toHaveLength(1);
    });
});
