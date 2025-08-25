/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { ChatTheme, Branding, AIModel } from './types';

export const DEFAULT_THEME: ChatTheme = {
    userBg: '#0077b6',
    userText: '#ffffff',
    botBg: '#1a1a2e',
    botText: '#f0f0f0',
    bgGradientStart: '#0f0c29',
    bgGradientEnd: '#24243e',
    sidebarBg: '#0f0c29',
    sidebarText: '#a9a9b3',
    sidebarHighlightBg: 'rgba(0, 191, 255, 0.1)',
};

export const DEFAULT_BRANDING: Branding = {
    loginTitle: 'AI Hub',
    loginSubtitle: 'Sign in to continue',
    hubTitle: 'Welcome',
    hubSubtitle: 'Select a workspace to get started',
    hubHeaderTitle: 'AI Hub',
    appLogo: 'https://plazz.ag/wp-content/uploads/2015/06/plazz_icon.png',
    enableGoogleLogin: true,
    googleClientId: '',
    googleClientSecret: '',
    enableMicrosoftLogin: true,
    microsoftClientId: '',
    microsoftClientSecret: '',
    enableCookieBanner: false,
    privacyPolicyUrl: '',
    integrations: {
        sharepoint: false,
        brevo: false,
        hubspot: false,
        docusign: false,
        outlook: false,
    }
};

export const DEFAULT_MODELS: AIModel[] = [
    { id: 'gemini-2.5-flash', api: 'google', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 4.75L10.25 9.25L5.75 11.75L10.25 14.25L12.75 18.75L15.25 14.25L19.75 11.75L15.25 9.25L12.75 4.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.75 4.75L10.25 9.25L5.75 11.75L10.25 14.25L12.75 18.75L15.25 14.25L19.75 11.75L15.25 9.25L12.75 4.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>` },
    { id: 'openai/gpt-4o', api: 'openai', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"></path><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"></path></svg>` },
    { id: 'anthropic/claude-3-opus', api: 'anthropic', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 16V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 8H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>` },
    { id: 'meta/llama-3-70b', api: 'meta', icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 15.5562C2 15.5562 5.33333 16.6671 8 15.5562C10.6667 14.4454 10.6667 11.1116 13.3333 10.0007C16 8.88989 18.6667 11.1116 22 10.0007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 8.88889C2 8.88889 5.33333 9.99978 8 8.88889C10.6667 7.77805 10.6667 4.44426 13.3333 3.33337C16 2.22249 18.6667 4.44426 22 3.33337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>` },
    { id: 'groq/llama3-8b-8192', api: 'groq', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`},
];

export const INITIAL_CONTAINERS_DATA = [
    {
        name: 'Data Security',
        description: 'Protecting our digital assets and infrastructure.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        cardImageUrl: 'https://images.unsplash.com/photo-1550751827-4138d04d405b?q=80&w=1280&auto=format&fit=crop',
        quickQuestions: ["What is phishing?", "Latest security threats?", "Recommend a password manager.", "How to secure my home Wi-Fi?"],
        availableModels: DEFAULT_MODELS.map(m => m.id),
        availablePersonas: ["Helpful Assistant", "Security Expert", "Strict Enforcer"],
        selectedModel: 'gemini-2.5-flash',
        selectedPersona: 'Helpful Assistant',
        functions: [],
        enabledIntegrations: [],
        knowledgeBase: [],
        accessControl: ["admin@company.com", "security-team"],
        theme: { userBg: '#0077b6', userText: '#ffffff', botBg: '#1a1a2e', botText: '#f0f0f0', bgGradientStart: '#0d1b2a', bgGradientEnd: '#1b263b', sidebarBg: '#0d1b2a', sidebarText: '#a9a9b3', sidebarHighlightBg: 'rgba(0, 191, 255, 0.1)' },
        isKnowledgeBasePublic: false,
    },
    {
        name: 'Sales',
        description: 'Driving growth, strategy, and revenue generation.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`,
        cardImageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1280&auto=format&fit=crop',
        quickQuestions: ["Summarize last week's leads.", "Who is our biggest competitor?", "Draft a follow-up email.", "Give me a sales pitch for Product X."],
        availableModels: DEFAULT_MODELS.map(m => m.id),
        availablePersonas: ["Helpful Assistant", "Sales Coach", "Data Analyst", "Brazilian Deal Closer"],
        selectedModel: 'gemini-2.5-flash',
        selectedPersona: 'Helpful Assistant',
        functions: [
            {
                id: 'func-sales-deal-intel-1',
                name: 'Deal Intelligence',
                description: 'Analyzes tender documents to provide insights on the client, market, and solution fit.',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
                parameters: [
                    { name: 'tenderText', type: 'textarea' as const, description: 'Paste the full text from the tender document or email.' }
                ],
                promptTemplate: `As a senior B2B sales analyst based in Germany, analyze the following tender document. Provide a concise, structured report in Markdown format covering these key areas:

1.  **Company Profile**: Identify the company issuing the tender. What is their industry, size, and potential strategic importance?
2.  **Core Requirements**: Summarize the top 3-5 technical and business requirements from the tender.
3.  **Solution Fit Analysis**: Briefly explain how our solutions could meet their requirements. Mention specific product strengths that are relevant.
4.  **Competitive Landscape**: Who are the likely competitors for this deal in the German market?
5.  **Next Steps**: Recommend the immediate next steps for the sales team to take.

Tender Text:
---
{tenderText}
---`,
                enabled: true,
            }
        ],
        enabledIntegrations: ['outlook'],
        knowledgeBase: [],
        accessControl: ["admin@company.com", "sales-team"],
        theme: { userBg: '#0077b6', userText: '#ffffff', botBg: '#1a1a2e', botText: '#f0f0f0', bgGradientStart: '#142b27', bgGradientEnd: '#2b413c', sidebarBg: '#142b27', sidebarText: '#a9a9b3', sidebarHighlightBg: 'rgba(0, 191, 255, 0.1)' },
        isKnowledgeBasePublic: false,
    }
];

export const AVAILABLE_ICONS_WITH_DESC = [
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`, description: 'A simple square, representing a generic or foundational container.' },
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`, description: 'A shield, representing security, protection, and defense.' },
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`, description: 'A bar chart, representing sales, data, analytics, and growth.' },
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`, description: 'An information symbol, for help, support, or general knowledge.' },
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`, description: 'A star, for special projects, favorites, or high-priority items.' },
    { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`, description: 'A package or box, representing products, inventory, or launches.' }
];

export const CARD_IMAGE_OPTIONS = [
    { url: 'https://images.unsplash.com/photo-1550751827-4138d04d405b?q=80&w=1280&auto=format&fit=crop', description: 'A server room with glowing blue lights, representing technology, data, and security.' },
    { url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1280&auto=format&fit=crop', description: 'A modern office meeting with professionals discussing charts, representing business, sales, and collaboration.' },
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1280&auto=format&fit=crop', description: 'A team working together at a desk with laptops and documents, representing teamwork, projects, and development.' },
    { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1280&auto=format&fit=crop', description: 'A close-up of a laptop showing financial charts and graphs, suitable for finance, analytics, or data-driven departments.' },
    { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1280&auto=format&fit=crop', description: 'A person presenting a strategy on a clear board, representing marketing, planning, and strategy.' },
    { url: 'https://images.unsplash.com/photo-1581092916374-03595232a51a?q=80&w=1280&auto=format&fit=crop', description: 'A scientist in a lab coat working with test tubes, representing research, science, and development.' },
];

export const AVAILABLE_ICONS = AVAILABLE_ICONS_WITH_DESC.map(i => i.svg);

export const FUNCTION_ICONS = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
];
