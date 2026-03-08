/**
 * Real Estate domain schemas.
 * Compose Layer 3 asset type patterns with real estate-specific fields.
 */

import type { PropertyType, LeaseStatus } from './enums.js';

/** Lease agreement metadata (composes Agreement). */
export interface LeaseAgreementSchema {
    type: 'LEASE_AGREEMENT';
    propertyId: string;
    propertyType: PropertyType;
    landlordId: string;
    tenantId: string;
    monthlyRent: number;
    currency: string;
    startDate: string;
    endDate: string;
    termsHash: string;
    status: LeaseStatus;
}

/** Payment milestone metadata (composes Milestone). */
export interface PaymentMilestoneSchema {
    type: 'PAYMENT_MILESTONE';
    leaseRef: string;
    period: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    paidAt?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
}
