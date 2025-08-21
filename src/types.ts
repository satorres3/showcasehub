/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export type { Part } from "@google/genai";
import type { Part as PartType } from "@google/genai"; // Import for local use

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string; // can be a data URL or a link
}

export interface FunctionParameter {
    name: string;
    type: 'string' | 'number' | 'textarea';
    description: string;
}

export interface AppFunction {
    id: string;
    name: string;
    description: string;
    icon: string;
    parameters: FunctionParameter[];
    promptTemplate: string;
    enabled: boolean;
}

export type ChatHistory = { role: 'user' | 'model'; parts: PartType[] }[];

export type ChatEntry = {
    id: string;
    name: string;
    history: ChatHistory;
};

export type KnowledgeFile = {
    name: string;
    type: string;
    base64Content: string;
    size: number;
    uploadDate: string;
};

export interface ChatTheme {
    userBg: string;
    userText: string;
    botBg: string;
    botText: string;
    bgGradientStart: string;
    bgGradientEnd: string;
    sidebarBg: string;
    sidebarText: string;
    sidebarHighlightBg: string;
}

export interface Branding {
    loginTitle: string;
    loginSubtitle: string;
    hubTitle: string;
    hubSubtitle: string;
    hubHeaderTitle: string;
    appLogo?: string; // base64 data URL
    enableGoogleLogin: boolean;
    googleClientId: string;
    googleClientSecret: string;
    enableMicrosoftLogin: boolean;
    microsoftClientId: string;
    microsoftClientSecret: string;
    enableCookieBanner: boolean;
    privacyPolicyUrl: string;
    integrations: {
        sharepoint: boolean;
        brevo: boolean;
        hubspot: boolean;
        docusign: boolean;
        outlook: boolean;
    };
}

export interface AIModel {
    id: string;
    icon: string;
    api: 'google' | 'openai' | 'anthropic' | 'meta' | 'groq';
}

export interface Container {
    id:string;
    name: string;
    description: string;
    icon: string; // Can be SVG string or base64 data URL
    cardImageUrl: string;
    quickQuestions: string[];
    availableModels: string[];
    availablePersonas: string[];
    selectedModel: string;
    selectedPersona: string;
    functions: AppFunction[];
    enabledIntegrations: string[];
    accessControl: string[];
    chats: ChatEntry[];
    activeChatId: string | null;
    knowledgeBase: KnowledgeFile[];
    theme: ChatTheme;
    isKnowledgeBasePublic: boolean;
}

export type ItemToDelete = {
    type: 'container' | 'chat' | 'knowledgeFile';
    containerId: string | null;
    chatId: string | null;
    fileName: string | null;
} | null;

export type DraftNewContainer = Omit<Container, 'id' | 'chats' | 'activeChatId' | 'availableModels' | 'selectedModel' | 'selectedPersona' | 'accessControl' | 'enabledIntegrations' | 'isKnowledgeBasePublic'>;