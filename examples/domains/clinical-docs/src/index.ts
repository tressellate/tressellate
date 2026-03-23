export type { ClinicalDocsConfig } from './config.js';

export type {
    ClinicalNoteSchema,
    PatientConsentSchema,
    ClinicalAssessmentSchema,
    BillingClaimSchema,
    NoteProvenanceSchema,
    TreatmentMilestoneSchema,
} from './schemas.js';

export {
    NoteFormat,
    Specialty,
    EncounterType,
    ConsentScope,
    ClaimStatus,
    ClinicalSchemaType,
} from './enums.js';

export type {
    NoteFormat as NoteFormatType,
    Specialty as SpecialtyType,
    EncounterType as EncounterTypeType,
    ConsentScope as ConsentScopeType,
    ClaimStatus as ClaimStatusType,
    ClinicalSchemaType as ClinicalSchemaTypeType,
} from './enums.js';
