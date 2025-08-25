/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { PublicClientApplication, EventType, type AuthenticationResult, type AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { state } from './state';
import type { User } from './types';
import { getMsalConfig } from './config';
import { showToast } from './ui';

export let isMsalConfigured = false;

let msalInstance: PublicClientApplication | null = null;

const GRAPH_SCOPES = {
    OPENID: "openid",
    PROFILE: "profile",
    USER_READ: "User.Read",
    FILES_READ_ALL: "Files.Read.All",
};

const GRAPH_REQUESTS = {
    LOGIN: {
        scopes: [GRAPH_SCOPES.USER_READ, GRAPH_SCOPES.FILES_READ_ALL]
    }
};

const GRAPH_ENDPOINTS = {
    ME: "https://graph.microsoft.com/v1.0/me",
    PHOTO: "https://graph.microsoft.com/v1.0/me/photo/$value"
};

export async function initializeMsal() {
    const config = await getMsalConfig();
    isMsalConfigured = !!(config.clientId && config.tenantId);

    if (!isMsalConfigured) {
        console.warn("MSAL configuration not found or incomplete from backend. Microsoft login will be disabled.");
        return;
    }

    const msalConfig = {
        auth: {
            clientId: config.clientId!,
            authority: `https://login.microsoftonline.com/${config.tenantId!}`,
            redirectUri: window.location.origin,
        },
        cache: {
            cacheLocation: "localStorage",
            storeAuthStateInCookie: false,
        }
    };
    msalInstance = new PublicClientApplication(msalConfig);

    // This ensures the instance is fully initialized before any other MSAL API calls.
    await msalInstance.initialize();

    // Optional: Add event callback to see what's happening
    msalInstance.addEventCallback((event: any) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
            const account = event.payload.account;
            msalInstance?.setActiveAccount(account);
        }
    });
}

export function login() {
    if (!msalInstance) {
        console.error("MSAL is not initialized. Check your environment variables.");
        throw new Error("MSAL not initialized.");
    }
    msalInstance.loginRedirect(GRAPH_REQUESTS.LOGIN);
}

export function logout() {
    if (!msalInstance) return;
    const account = getActiveAccount();
    if(account) {
        msalInstance.logoutRedirect({ account });
    }
}

export function getActiveAccount(): AccountInfo | null {
    if (!msalInstance) return null;
    return msalInstance.getActiveAccount();
}

export async function handleRedirect(): Promise<AccountInfo | null> {
    if (!msalInstance) return null;
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
        return response.account;
    }
    return getActiveAccount();
}

export async function getGraphToken(scopes: string[]): Promise<string | null> {
    if (!msalInstance) throw new Error("MSAL not initialized.");
    const account = getActiveAccount();
    if (!account) throw new Error("No active account.");

    const request = { scopes, account };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            console.warn("Silent token acquisition failed. Trying popup.");
            try {
                const response = await msalInstance.acquireTokenPopup(request);
                msalInstance.setActiveAccount(response.account);
                return response.accessToken;
            } catch (popupError) {
                console.error("Popup token acquisition failed.", popupError);
                showToast("Could not get permission to access your files.", "error");
                return null;
            }
        } else {
            console.error("Token acquisition failed with an unexpected error.", error);
            showToast("An error occurred while authenticating.", "error");
            return null;
        }
    }
}

export async function getGraphProfile(): Promise<User> {
    const accessToken = await getGraphToken([GRAPH_SCOPES.USER_READ]);
    if (!accessToken) throw new Error("Could not acquire token for Graph profile.");

    // Fetch user profile
    const profileResponse = await fetch(GRAPH_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!profileResponse.ok) throw new Error("Failed to fetch Graph profile.");
    const profileData = await profileResponse.json();

    // Fetch user photo
    let avatarUrl = '';
    try {
        const photoResponse = await fetch(GRAPH_ENDPOINTS.PHOTO, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            avatarUrl = URL.createObjectURL(blob);
        }
    } catch (error) {
        console.warn("Could not fetch user photo from Graph.", error);
    }
    
    return {
        firstName: profileData.givenName || '',
        lastName: profileData.surname || '',
        email: profileData.userPrincipalName || '',
        avatarUrl: avatarUrl
    };
}