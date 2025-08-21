/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { loadMsalConfig as apiLoadMsalConfig } from './backend';

export interface MsalConfig {
    clientId: string | null;
    tenantId: string | null;
}

// Cache for the configuration to avoid multiple fetches.
let msalConfig: MsalConfig | null = null;

/**
 * Fetches the MSAL configuration from the backend layer.
 * Caches the configuration after the first successful fetch.
 */
export async function getMsalConfig(): Promise<MsalConfig> {
    // Return from cache if available
    if (msalConfig) {
        return msalConfig;
    }

    // Fetch from the backend abstraction, cache it, and then return.
    msalConfig = await apiLoadMsalConfig();
    return msalConfig;
}
