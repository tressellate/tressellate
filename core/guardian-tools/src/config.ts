import type { HederaConfig } from '@trellis-mcp/core/config';

/**
 * Guardian configuration.
 * Extends HederaConfig with Guardian-specific connection details.
 * Placeholder — will be populated when Guardian integration is implemented.
 */
export interface GuardianConfig extends HederaConfig {
    /** Guardian API base URL. */
    guardianApiUrl?: string;
    /** Guardian access token. */
    guardianAccessToken?: string;
}
