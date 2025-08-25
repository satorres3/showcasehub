/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, Part } from "@google/genai";
import { FUNCTION_ICONS, AVAILABLE_ICONS_WITH_DESC, CARD_IMAGE_OPTIONS } from './constants';
import type { AppFunction, ChatHistory, KnowledgeFile } from "./types";

// This is a critical check for production deployments.
// If the API_KEY is not set in the environment (e.g., Azure SWA configuration),
// we create a mock 'ai' object that will throw informative errors when used.
// This prevents the app from crashing and helps diagnose configuration issues.
let ai: GoogleGenAI;
if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. AI features will be disabled.");
    // Create a mock object that throws an error when any of its methods are called.
    // This makes the application more robust if the API key is missing.
    ai = new Proxy({}, {
        get(target, prop, receiver) {
            if (prop === 'models' || prop === 'operations' || prop === 'chats') {
                return new Proxy({}, {
                     get() {
                        return () => {
                            throw new Error("AI Service is not configured. Please ensure the API_KEY is set in the environment settings.");
                        };
                    }
                });
            }
            return Reflect.get(target, prop, receiver);
        }
    }) as GoogleGenAI;
} else {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export async function generateSuggestions(containerName: string, suggestionType: 'questions' | 'personas'): Promise<string[]> {
    const prompt = suggestionType === 'questions'
        ? `Based on a container named '${containerName}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries.`
        : `Based on a container named '${containerName}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide', 'Data-driven Analyst', 'Creative Brainstormer'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return JSON.parse(response.text).suggestions || [];
    } catch (error) {
        console.error(`Error generating ${suggestionType}:`, error);
        throw new Error(`Sorry, I couldn't generate suggestions. Please try again.`);
    }
}

export async function generateFunction(userRequest: string): Promise<Omit<AppFunction, 'id' | 'enabled'>> {
    const prompt = `Based on the user request for a function: "${userRequest}", generate a configuration for it. The function should run inside a chat application. 
     - Define a short, clear 'name'.
     - Write a concise one-sentence 'description'.
     - Select a suitable SVG 'icon' from the provided list.
     - Define 1 to 3 input 'parameters' the user needs to provide (name, type, description). Parameter 'type' must be one of: 'string', 'number', 'textarea'.
     - Create a detailed 'promptTemplate' to be sent to another AI model. The prompt template must use placeholders like {parameterName} for each parameter defined.
    Available icons:\n${FUNCTION_ICONS.join('\n')}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, icon: { type: Type.STRING },
                        parameters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['string', 'number', 'textarea'] }, description: { type: Type.STRING } }, required: ['name', 'type', 'description'] } },
                        promptTemplate: { type: Type.STRING }
                    },
                    required: ['name', 'description', 'icon', 'parameters', 'promptTemplate']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating function:`, error);
        throw new Error(`Sorry, I couldn't generate the function. The model might have returned an invalid structure. Please try again with a different request.`);
    }
}

export async function generateContainerDetails(containerName: string, containerType: string, websiteUrl?: string) {
    const iconDescriptions = JSON.stringify(AVAILABLE_ICONS_WITH_DESC);
    const imageDescriptions = JSON.stringify(CARD_IMAGE_OPTIONS);
    let contextPrompt = `A user wants to create a new container in an application. The container is named "${containerName}" and is of the type "${containerType}".`;
    if (containerType === 'product' && websiteUrl) {
        contextPrompt += ` The product's website is ${websiteUrl}. Please analyze the website content to inform your suggestions, especially for the description, quick questions, and functions, making them highly relevant to the product. For example, a support bot for a software product might need functions to check system status or explain features.`;
    } else if (containerType === 'department') {
        contextPrompt += ` The container is for a corporate department. Tailor suggestions to a professional, internal-use context. For example, an HR container might need functions for leave policies or benefits lookup.`;
    }

    const prompt = `${contextPrompt}
Based on this context, generate a complete configuration:
- **description**: A concise, one-sentence summary of the container's purpose.
- **icon**: Choose the most appropriate SVG icon from the provided list by returning its exact SVG string.
- **cardImageUrl**: Choose the most thematically appropriate image URL from the provided list for a background card, paying close attention to the container's name ('${containerName}') and its purpose.
- **theme**: Suggest a complete color theme with nine hex color codes: userBg, userText, botBg, botText, bgGradientStart, bgGradientEnd, sidebarBg, sidebarText, and sidebarHighlightBg. Choose colors that are aesthetically pleasing, accessible (good contrast), and reflect the container's purpose (e.g., professional tones for 'Finance', creative colors for 'Design').
- **quickQuestions**: Generate an array of 4 diverse and insightful string 'quick questions' a user might ask.
- **availablePersonas**: Generate an array of 4 creative and distinct string 'personas' for the AI assistant.
- **functions**: Generate an array of 2-3 relevant 'functions' a user might need. For each function, provide: name, description, an icon from the function icon list, 1-2 parameters (name, type, description), and a detailed promptTemplate using placeholders like {parameterName}.
- **initialKnowledgeFile**: If a website URL was provided, generate a text file summarizing the key information from the site. This object must have a 'name' (e.g., "Website_Summary.txt") and 'content' (a plain-text summary). If no URL, return null for this field.

Available container icons: ${iconDescriptions}
Available card images: ${imageDescriptions}
Available function icons: ${FUNCTION_ICONS.join('\n')}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        cardImageUrl: { type: Type.STRING },
                        theme: {
                            type: Type.OBJECT,
                            properties: { userBg: { type: Type.STRING }, userText: { type: Type.STRING }, botBg: { type: Type.STRING }, botText: { type: Type.STRING }, bgGradientStart: { type: Type.STRING }, bgGradientEnd: { type: Type.STRING }, sidebarBg: { type: Type.STRING }, sidebarText: { type: Type.STRING }, sidebarHighlightBg: { type: Type.STRING } },
                            required: ['userBg', 'userText', 'botBg', 'botText', 'bgGradientStart', 'bgGradientEnd', 'sidebarBg', 'sidebarText', 'sidebarHighlightBg']
                        },
                        quickQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        availablePersonas: { type: Type.ARRAY, items: { type: Type.STRING } },
                        functions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING }, description: { type: Type.STRING }, icon: { type: Type.STRING },
                                    parameters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['string', 'number', 'textarea'] }, description: { type: Type.STRING } }, required: ['name', 'type', 'description'] } },
                                    promptTemplate: { type: Type.STRING }
                                },
                                required: ['name', 'description', 'icon', 'parameters', 'promptTemplate']
                            }
                        },
                        initialKnowledgeFile: { type: Type.OBJECT, nullable: true, properties: { name: { type: Type.STRING }, content: { type: Type.STRING } } }
                    },
                    required: ['description', 'icon', 'cardImageUrl', 'theme', 'quickQuestions', 'availablePersonas', 'functions']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating container details:", error);
        throw new Error("Could not generate suggestions. Please fill in manually.");
    }
}

export async function generateChatName(history: ChatHistory): Promise<string> {
    if (history.length < 2) return "New Conversation";
    const firstUserPart = history[0].parts.find(p => 'text' in p);
    const firstModelPart = history[1].parts.find(p => 'text' in p);
    if (!firstUserPart || !('text' in firstUserPart) || !firstModelPart || !('text' in firstModelPart)) return "New Conversation";

    const prompt = `Based on the following conversation, create a very short, concise title (max 5 words, and no quotes).\n\nConversation:\nUser: "${firstUserPart.text}"\nModel: "${firstModelPart.text}"`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim().replace(/["']/g, ""); // Remove quotes from response
    } catch (error) {
        console.error("Error generating chat name:", error);
        return "New Conversation";
    }
}

export async function streamChatResponse(model: string, persona: string, knowledgeBase: KnowledgeFile[], userParts: Part[]) {
    return ai.models.generateContentStream({
        model: model,
        contents: {
            parts: [
                ...knowledgeBase.map(file => ({
                    inlineData: {
                        mimeType: file.type,
                        data: file.base64Content.split(',')[1]
                    }
                })),
                ...userParts
            ]
        },
        config: {
            systemInstruction: `You are an AI assistant. Your current persona is: ${persona}.`
        }
    });
}

export async function generateQuestionsFromKnowledge(knowledgeBase: KnowledgeFile[]): Promise<string[]> {
    if (knowledgeBase.length === 0) {
        return [];
    }

    const combinedText = knowledgeBase.map(file => {
        try {
            if (!file.type.startsWith('text/') && file.type !== 'application/pdf') return '';
            const base64Data = file.base64Content.split(',')[1];
            if (!base64Data) return '';
            return atob(base64Data);
        } catch (e) {
            console.error(`Could not decode base64 for file ${file.name}`, e);
            return '';
        }
    }).join('\n\n').substring(0, 10000);

    if (combinedText.trim().length === 0) {
        return [];
    }

    const prompt = `Based on the following information from a knowledge base, generate 4 insightful and relevant "quick questions" a user might ask an AI assistant. The questions should be diverse and cover key topics present in the text.

<knowledge_base_content>
${combinedText}
</knowledge_base_content>

Generate only the questions.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 4 generated questions."
                        }
                    },
                    required: ["questions"]
                }
            }
        });
        const result = JSON.parse(response.text);
        return result.questions || [];
    } catch (error) {
        console.error(`Error generating questions from knowledge:`, error);
        return [];
    }
}