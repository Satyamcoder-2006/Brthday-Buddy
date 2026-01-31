/**
 * Environment Variable Validation
 * 
 * Validates required and optional environment variables on app startup
 */

interface EnvConfig {
    required: string[];
    optional: string[];
}

const ENV_CONFIG: EnvConfig = {
    required: [
        'EXPO_PUBLIC_SUPABASE_URL',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ],
    optional: [
        'EXPO_PUBLIC_GEMINI_API_KEY',
        'EXPO_PUBLIC_MISTRAL_API_KEY',
    ],
};

export class EnvironmentValidationError extends Error {
    constructor(missingVars: string[]) {
        super(`Missing required environment variables: ${missingVars.join(', ')}`);
        this.name = 'EnvironmentValidationError';
    }
}

/**
 * Validates that all required environment variables are present
 * Warns about missing optional variables
 * 
 * @throws {EnvironmentValidationError} If required variables are missing
 */
export const validateEnvironment = (): void => {
    const missing = ENV_CONFIG.required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new EnvironmentValidationError(missing);
    }

    // Check optional AI keys
    const hasGemini = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    const hasMistral = Boolean(process.env.EXPO_PUBLIC_MISTRAL_API_KEY);

    if (!hasGemini && !hasMistral) {
        console.warn(
            '⚠️  No AI API keys found (Gemini or Mistral). ' +
            'Gift suggestions will use fallback mock data.'
        );
    } else {
        const providers = [];
        if (hasGemini) providers.push('Gemini');
        if (hasMistral) providers.push('Mistral');
        console.log(`✓ AI providers configured: ${providers.join(', ')}`);
    }

    console.log('✓ Environment validation passed');
};

/**
 * Check if specific environment variable exists
 */
export const hasEnvVar = (key: string): boolean => {
    return Boolean(process.env[key]);
};

/**
 * Get environment variable with fallback
 */
export const getEnvVar = (key: string, fallback: string = ''): string => {
    return process.env[key] || fallback;
};
