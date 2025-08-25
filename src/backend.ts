/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DEFAULT_BRANDING, DEFAULT_MODELS, INITIAL_CONTAINERS_DATA } from "./constants";
import type { AIModel, Branding, Container } from "./types";

// NOTE: This file is the starting point for a backend abstraction layer.
// All functions here are placeholders for real API calls.

export interface MsalConfigPayload {
    clientId: string | null;
    tenantId: string | null;
}

interface AppStatePayload {
    containers: Container[];
    branding: Branding;
    availableModels: AIModel[];
}


/**
 * Loads the MSAL configuration from the backend.
 *
 * In a real application, this would fetch from an endpoint like '/api/auth-config'.
 * For now, it simulates this by reading from frontend environment variables.
 */
export async function loadMsalConfig(): Promise<MsalConfigPayload> {
    console.log("Simulating API call to load MSAL config...");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real backend, these values would come from the server's environment.
    // This simulation reads them from the Vite/.env build-time environment.
    return {
        clientId: process.env.MSAL_CLIENT_ID || null,
        tenantId: process.env.MSAL_TENANT_ID || null,
    };
}

/**
 * Loads the entire application state from the backend.
 *
 * This is a simulation that uses localStorage. If no state is found,
 * it initializes the app with default data from constants.
 */
export async function loadAppState(): Promise<AppStatePayload> {
    console.log("Simulating API call to load app state...");
    await new Promise(resolve => setTimeout(resolve, 100));

    const savedStateJSON = localStorage.getItem('appState');
    if (savedStateJSON) {
        try {
            const parsed = JSON.parse(savedStateJSON);
            // Basic validation to ensure the loaded data has the expected shape
            if (parsed && Array.isArray(parsed.containers) && parsed.branding && Array.isArray(parsed.availableModels)) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse state from localStorage, initializing with defaults.", e);
            localStorage.removeItem('appState'); // Clear corrupted state
        }
    }

    // If no valid state is in localStorage, create the initial state.
    console.log("No valid saved state found, creating initial state from constants.");
    const initialContainers: Container[] = INITIAL_CONTAINERS_DATA.map((c, index) => ({
        ...c,
        id: `cont-${Date.now()}-${index}`,
        chats: [],
        activeChatId: null,
    }));

    return {
        containers: initialContainers,
        branding: DEFAULT_BRANDING,
        availableModels: DEFAULT_MODELS,
    };
}

/**
 * Saves the entire application state to the backend.
 *
 * This is a simulation that uses localStorage.
 */
export async function saveAppState(appState: AppStatePayload): Promise<void> {
    console.log("Simulating API call to save app state...");
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        const jsonState = JSON.stringify(appState);
        localStorage.setItem('appState', jsonState);
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
}

/**
 * Queries the backend knowledge base for a given question. Returns the answer
 * if the service can resolve it, otherwise returns null.
 */
export async function queryKnowledgeBase(question: string): Promise<string | null> {
    try {
        const response = await fetch(`/api/knowledge?q=${encodeURIComponent(question)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.answer ?? null;
    } catch (error) {
        console.error('Failed to query knowledge base:', error);
        return null;
    }
}

