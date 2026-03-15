import type { MCPTool } from '@tressellate/core/config';
import type { GuardianConfig } from './config.js';

export type { GuardianConfig } from './config.js';
export type { VerifiableCredential, PersonaCredential, Policy } from './types.js';

// GovernanceProvider interface + implementations
export type {
	GovernanceProvider,
	ProviderCapabilities,
	VerificationResult,
	PersonaResolution
} from './governance-provider.js';
export { NoopGovernanceProvider } from './providers/index.js';

/**
 * Guardian MCP tools.
 * Empty for now — will be populated when Guardian integration is implemented.
 */
export const GUARDIAN_TOOLS: MCPTool<GuardianConfig>[] = [];
