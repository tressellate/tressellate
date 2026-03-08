import type { HederaConfig } from '../config.js';

/**
 * Creates a config field validator that extracts a required string field.
 * Replaces requireTerraPrimaCollectionId, requireBatchcertCollectionId, etc.
 *
 * @param field - Config field name to validate
 * @param errorMessage - Error message if field is missing
 */
export function requireConfigField<TConfig extends HederaConfig>(
    field: keyof TConfig,
    errorMessage: string
): (config: TConfig) => string {
    return (config: TConfig) => {
        const value = config[field];
        if (!value) {
            throw new Error(errorMessage);
        }
        return value as string;
    };
}
