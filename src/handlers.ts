/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DOM, reQueryDOM } from './dom';
import { state } from './state';
import {
    showPage, renderSidebar, renderChatHistory, addMessageToUI, openFunctionRunner,
    closeModal, showToast, renderAllContainers, renderAddContainerSuggestions,
    checkForSettingChanges, renderKnowledgeFiles, renderModelManagementList, renderContainerSettings,
    checkForGlobalSettingChanges, applyTheme, applyContainerTheme, renderUserProfile
} from './ui';
import {
    generateFunction, generateContainerDetails,
    generateChatName, streamChatResponse, generateSuggestions
} from './api';
import { saveState, fileToBase64, formatDate, markdownToHtml } from './utils';
import type { AppFunction, ChatEntry, Container, KnowledgeFile, Part } from './types';
import { DEFAULT_THEME, FUNCTION_ICONS } from './constants';
import * as auth from './auth';
import * as graph from './graph';
import { queryKnowledgeBase } from './backend';

// General UI Handlers
// =============================================================================

export const handleCloseAllPopups = (exclude?: HTMLElement | null) => {
    document.querySelectorAll('.user-profile-trigger[aria-expanded="true"]').forEach(trigger => {
        if (!exclude || !trigger.parentElement?.contains(exclude)) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.nextElementSibling?.classList.add('hidden');
        }
    });
    document.querySelectorAll('.custom-select.open').forEach(sel => {
        if (!exclude || !sel.contains(exclude)) {
            sel.classList.remove('open');
            sel.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
            sel.querySelector('.select-options')?.classList.add('hidden');
        }
    });
    if (!exclude || !DOM.buttons.attachment?.contains(exclude)) {
        DOM.containers.attachmentOptions?.classList.add('hidden');
    }
};

export const handleTabClick = (tabsContainer: HTMLElement, panels: NodeListOf<HTMLElement>, event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const tabButton = target.closest<HTMLElement>('.tab-link');
    if (!tabButton || tabButton.classList.contains('active')) return;

    const tabId = tabButton.dataset.tab;
    if (!tabId) return;

    tabsContainer.querySelector('.active')?.classList.remove('active');
    tabButton.classList.add('active');

    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
    });
};

// Navigation & Auth
// =============================================================================

export const handleGoogleLogin = async () => {
    // Mock user login
    state.currentUser = {
        firstName: 'Alex',
        lastName: 'Thorne',
        email: 'alex.thorne@example.com',
        avatarUrl: '' // Empty string can mean use default icon
    };
    applyTheme(DEFAULT_THEME);
    await showPage('hub');
    renderUserProfile();
};

export const handleMicrosoftLogin = () => {
    if (!auth.isMsalConfigured) {
        showToast("Microsoft login service is unavailable. Please contact an administrator.", 'error');
        return;
    }
    auth.login();
};

export const handleLogout = async () => {
    auth.logout();
    state.currentUser = null;
    await showPage('login');
};

export const handleContainerCardClick = async (containerId: string) => {
    const container = state.containers.find(c => c.id === containerId);
    if (!container) return;

    state.currentContainerId = containerId;
    applyContainerTheme(container);
    await showPage('department', container.name);
    renderUserProfile();
};

// Chat Handlers
// =============================================================================

export const handleNewChat = async () => {
    if (!state.currentContainerId) return;
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container) return;

    container.activeChatId = null;
    await saveState();
    renderSidebar(state.currentContainerId);
    renderChatHistory(state.currentContainerId);
};

export const handleSendMessage = async () => {
    if (!DOM.inputs.chat || !state.currentContainerId) return;
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container) return;

    const promptText = DOM.inputs.chat.value.trim();
    if (!promptText && !state.attachedFile) return;

    DOM.forms.chat?.classList.add('thinking');
    if(DOM.buttons.sendChat) DOM.buttons.sendChat.disabled = true;
    DOM.loaders.sendChat?.classList.remove('hidden');

    const userParts: Part[] = [];
    if (promptText) {
        userParts.push({ text: promptText });
    }
    if (state.attachedFile) {
        userParts.push({
            inlineData: {
                mimeType: state.attachedFile.type,
                data: state.attachedFile.base64.split(',')[1]
            }
        });
    }

    let activeChat = container.chats.find(c => c.id === container.activeChatId);
    if (!activeChat) {
        activeChat = {
            id: `chat-${Date.now()}`,
            name: "New Conversation",
            history: []
        };
        container.chats.push(activeChat);
        container.activeChatId = activeChat.id;
    }

    activeChat.history.push({ role: 'user', parts: userParts });
    addMessageToUI(userParts, 'user');

    DOM.inputs.chat.value = '';
    DOM.inputs.chat.style.height = 'auto';
    handleRemoveAttachment();

    const thinkingIndicator = addMessageToUI([], 'bot', true);

    try {
        const kbAnswer = promptText ? await queryKnowledgeBase(promptText) : null;
        if (kbAnswer) {
            if (thinkingIndicator) thinkingIndicator.remove();
            addMessageToUI([{ text: kbAnswer }], 'bot');
            activeChat.history.push({ role: 'model', parts: [{ text: kbAnswer }] });
            if (activeChat.history.length === 2) {
                activeChat.name = await generateChatName(activeChat.history);
            }
            await saveState();
            renderSidebar(state.currentContainerId);
            return;
        }

        const stream = await streamChatResponse(
            container.selectedModel,
            container.selectedPersona,
            container.knowledgeBase,
            userParts
        );

        let botResponseText = "";
        let botMessageDiv = thinkingIndicator;

        for await (const chunk of stream) {
            if (thinkingIndicator && botMessageDiv === thinkingIndicator) {
                thinkingIndicator.remove();
                botMessageDiv = addMessageToUI([{ text: '' }], 'bot');
            }
            if (botMessageDiv) {
                botResponseText += chunk.text;
                botMessageDiv.innerHTML = markdownToHtml(botResponseText);
            }
        }

        if (botMessageDiv) {
             activeChat.history.push({ role: 'model', parts: [{ text: botResponseText }] });
        }

        if (activeChat.history.length === 2) {
            activeChat.name = await generateChatName(activeChat.history);
        }

        await saveState();
        renderSidebar(state.currentContainerId);

    } catch (error) {
        console.error("Chat error:", error);
        if (thinkingIndicator) thinkingIndicator.remove();
        addMessageToUI([{ text: "Sorry, I encountered an error. Please try again." }], 'bot');
    } finally {
        DOM.forms.chat?.classList.remove('thinking');
        if(DOM.buttons.sendChat) DOM.buttons.sendChat.disabled = true;
        DOM.loaders.sendChat?.classList.add('hidden');
    }
};

export const handleHistoryClick = async (containerId: string, chatId: string) => {
    const container = state.containers.find(c => c.id === containerId);
    if (!container) return;
    container.activeChatId = chatId;
    await saveState();
    renderSidebar(containerId);
    renderChatHistory(containerId);
};

// Attachment Handlers
// =============================================================================

export const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
        const base64 = await fileToBase64(file);
        state.attachedFile = { name: file.name, type: file.type, base64 };
        if (DOM.containers.attachmentPreview && DOM.textElements.attachmentFilename) {
            DOM.containers.attachmentPreview.classList.remove('hidden');
            DOM.textElements.attachmentFilename.textContent = file.name;
        }
        if(DOM.buttons.sendChat) DOM.buttons.sendChat.disabled = false;
    } catch (error) {
        showToast("Error reading file.", 'error');
    }
};

export const handleSharePointFileForChat = async (files: { siteId: string; itemId: string; name: string; mimeType: string; size: number }[]) => {
    if (files.length === 0) return;
    const fileInfo = files[0];
    showToast(`Downloading "${fileInfo.name}"...`);
    try {
        const knowledgeFile = await graph.downloadSharePointFile(fileInfo.siteId, fileInfo.itemId, fileInfo.name, fileInfo.mimeType, fileInfo.size);
        state.attachedFile = {
            name: knowledgeFile.name,
            type: knowledgeFile.type,
            base64: knowledgeFile.base64Content
        };
        if (DOM.containers.attachmentPreview && DOM.textElements.attachmentFilename) {
            DOM.containers.attachmentPreview.classList.remove('hidden');
            DOM.textElements.attachmentFilename.textContent = knowledgeFile.name;
        }
        if (DOM.buttons.sendChat) DOM.buttons.sendChat.disabled = false;
        closeModal(DOM.modals.sharepointPicker);
    } catch (error) {
        console.error("Error downloading SharePoint file for chat:", error);
        showToast(error instanceof Error ? error.message : 'Failed to download file.', 'error');
    }
};

export const handleRemoveAttachment = () => {
    state.attachedFile = null;
    if (DOM.containers.attachmentPreview) {
        DOM.containers.attachmentPreview.classList.add('hidden');
    }
    if (DOM.inputs.fileUpload) {
        DOM.inputs.fileUpload.value = '';
    }
    if (DOM.inputs.chat && DOM.buttons.sendChat) {
        DOM.buttons.sendChat.disabled = DOM.inputs.chat.value.trim().length === 0;
    }
};

// Delete Confirmation Handlers
// =============================================================================

export const openDeleteModal = async (mainText: string, description: string) => {
    try {
        const response = await fetch('src/modals/delete-confirm.html');
        if (!response.ok) throw new Error('Could not load modal content.');
        const html = await response.text();
        if (DOM.modals.deleteConfirm) {
            DOM.modals.deleteConfirm.innerHTML = html;
        }
        
        reQueryDOM();

        if (!DOM.modals.deleteConfirm || !DOM.textElements.deleteItemName || !DOM.textElements.deleteConfirmDescription) return;
        DOM.textElements.deleteItemName.textContent = mainText;
        DOM.textElements.deleteConfirmDescription.textContent = description;
        DOM.modals.deleteConfirm.classList.remove('hidden');
    } catch (error) {
        console.error('Failed to open delete modal:', error);
        showToast('Error opening modal.', 'error');
    }
};

export const handleDeleteContainerClick = async () => {
    if (!state.currentSettingsContainerId) return;
    const container = state.containers.find(c => c.id === state.currentSettingsContainerId);
    if (!container) return;
    state.itemToDelete = { type: 'container', containerId: container.id, chatId: null, fileName: null };
    await openDeleteModal(container.name, "This action cannot be undone. All associated chats and knowledge will be permanently deleted.");
};

export const handleDeleteChatClick = async (containerId: string, chatId: string) => {
    const container = state.containers.find(c => c.id === containerId);
    const chat = container?.chats.find(c => c.id === chatId);
    if (!chat) return;
    state.itemToDelete = { type: 'chat', containerId, chatId, fileName: null };
    await openDeleteModal(`chat "${chat.name}"`, "This will permanently delete the chat history.");
};

export const handleDeleteFileClick = async (containerId: string, fileName: string) => {
    state.itemToDelete = { type: 'knowledgeFile', containerId, chatId: null, fileName };
    await openDeleteModal(`file "${fileName}"`, "This will permanently delete the file from the knowledge base.");
};

export const handleConfirmDelete = async () => {
    if (!state.itemToDelete) return;
    const { type, containerId, chatId, fileName } = state.itemToDelete;
    let container;

    switch (type) {
        case 'container':
            state.containers = state.containers.filter(c => c.id !== containerId);
            showToast('Container deleted.');
            await showPage('containerManagement');
            renderAllContainers();
            break;
        case 'chat':
            container = state.containers.find(c => c.id === containerId);
            if (container) {
                const wasActiveChat = container.activeChatId === chatId;
                
                // Remove the chat from the list
                container.chats = container.chats.filter(ch => ch.id !== chatId);
                
                // Update the sidebar to remove the chat from the history list.
                renderSidebar(container.id);
                
                // If the deleted chat was the one being viewed, reset the active chat state
                // and re-render the chat area to show the welcome screen.
                if (wasActiveChat) {
                    container.activeChatId = null;
                    renderChatHistory(container.id);
                }
            }
            break;
        case 'knowledgeFile':
            container = state.containers.find(c => c.id === containerId);
            if (container) {
                container.knowledgeBase = container.knowledgeBase.filter(f => f.name !== fileName);
                renderKnowledgeFiles();
            }
            break;
    }

    await saveState();
    state.itemToDelete = null;
    closeModal(DOM.modals.deleteConfirm);
};


// Add Container Modal Handlers
// =============================================================================

export const handleAddContainerClick = async () => {
    try {
        const response = await fetch('src/modals/add-container.html');
        if (!response.ok) throw new Error('Could not load modal content.');
        const html = await response.text();
        if (DOM.modals.addContainer) {
            DOM.modals.addContainer.innerHTML = html;
        }

        reQueryDOM(); // Re-query to get new modal elements

        DOM.forms.addContainer?.reset();
        if(DOM.buttons.createContainer) DOM.buttons.createContainer.disabled = true;
        if(DOM.buttons.generateAi) DOM.buttons.generateAi.disabled = true;
        state.draftNewContainer = null;
        DOM.containers.aiSuggestions?.classList.add('hidden');
        DOM.modals.addContainer?.classList.remove('hidden');
        if (DOM.previews.addCustomIcon) {
            DOM.previews.addCustomIcon.classList.add('hidden');
            DOM.previews.addCustomIcon.src = '';
        }
    } catch (error) {
        console.error('Failed to open add container modal:', error);
        showToast('Error opening modal.', 'error');
    }
};

export const handleContainerNameInput = () => {
    if (DOM.inputs.containerName && DOM.buttons.generateAi && DOM.buttons.createContainer) {
        const hasName = DOM.inputs.containerName.value.trim().length > 2;
        DOM.buttons.generateAi.disabled = !hasName;
        DOM.buttons.createContainer.disabled = !hasName;
    }
};

export const handleGenerateContainerDetails = async () => {
    if (!DOM.inputs.containerName || !DOM.inputs.containerType) return;
    const name = DOM.inputs.containerName.value;
    const type = DOM.inputs.containerType.value;
    const url = DOM.inputs.containerWebsite?.value;

    if (DOM.textElements.aiStatusSpinner) DOM.textElements.aiStatusSpinner.classList.remove('hidden');
    if (DOM.textElements.aiStatusText) DOM.textElements.aiStatusText.textContent = 'Generating creative ideas...';
    if(DOM.buttons.generateAi) DOM.buttons.generateAi.disabled = true;
    DOM.loaders.aiGenerate?.classList.remove('hidden');

    try {
        const details = await generateContainerDetails(name, type, url);
        state.draftNewContainer = {
            ...details,
            name,
            functions: details.functions.map((f: any) => ({...f, id: `func-draft-${Math.random()}`, enabled: true }))
        };
        renderAddContainerSuggestions();
        DOM.containers.aiSuggestions?.classList.remove('hidden');
    } catch (error) {
        showToast(error instanceof Error ? error.message : "An unknown error occurred.", 'error');
    } finally {
        if (DOM.textElements.aiStatusSpinner) DOM.textElements.aiStatusSpinner.classList.add('hidden');
        if (DOM.textElements.aiStatusText) DOM.textElements.aiStatusText.textContent = 'AI suggestions are ready!';
        if(DOM.buttons.generateAi) DOM.buttons.generateAi.disabled = false;
        DOM.loaders.aiGenerate?.classList.add('hidden');
    }
};

export const handleCreateContainer = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!DOM.inputs.containerName || !DOM.inputs.containerDesc || !DOM.containers.containerIconSelector) return;

    const name = DOM.inputs.containerName.value;
    const description = DOM.inputs.containerDesc.value;
    const selectedIconEl = DOM.containers.containerIconSelector.querySelector('.selected');
    const customIconSrc = DOM.previews.addCustomIcon?.src;

    let icon = selectedIconEl ? selectedIconEl.innerHTML : FUNCTION_ICONS[0];
    if (customIconSrc && !DOM.previews.addCustomIcon?.classList.contains('hidden')) {
        icon = customIconSrc;
    }

    const draft = state.draftNewContainer;
    const newContainer: Container = {
        id: `cont-${Date.now()}`,
        name, description, icon,
        cardImageUrl: draft?.cardImageUrl || '',
        theme: draft?.theme || DEFAULT_THEME,
        quickQuestions: draft?.quickQuestions || [],
        availablePersonas: draft?.availablePersonas || ['Helpful Assistant'],
        functions: draft?.functions.map(f => ({ ...f, id: `func-${Date.now()}-${Math.random()}`, enabled: true })) || [],
        availableModels: [...state.availableModels.map(m => m.id)],
        selectedModel: state.availableModels[0]?.id || '',
        selectedPersona: draft?.availablePersonas[0] || 'Helpful Assistant',
        enabledIntegrations: [],
        accessControl: ['admin@company.com'],
        chats: [],
        activeChatId: null,
        knowledgeBase: [],
        isKnowledgeBasePublic: true,
    };

    state.containers.push(newContainer);
    await saveState();
    renderAllContainers();
    closeModal(DOM.modals.addContainer);
    showToast('Container created successfully!');
};


// Settings Page Handlers
// =============================================================================

export const handleSettingChange = () => {
    checkForSettingChanges();
};

const createListDeleteHandler = (listType: 'quickQuestions' | 'availablePersonas' | 'accessControl') => (itemToDelete: string) => {
    if (state.draftSettingsContainer) {
        (state.draftSettingsContainer[listType] as string[]) = state.draftSettingsContainer[listType].filter(item => item !== itemToDelete);
        renderContainerSettings(state.draftSettingsContainer.id);
        handleSettingChange();
    }
};

export const handleDeleteQuickQuestion = createListDeleteHandler('quickQuestions');
export const handleDeletePersona = createListDeleteHandler('availablePersonas');
export const handleDeleteAccessor = createListDeleteHandler('accessControl');

export const handleDeleteFunction = (functionId: string) => {
     if (state.draftSettingsContainer) {
        state.draftSettingsContainer.functions = state.draftSettingsContainer.functions.filter(f => f.id !== functionId);
        renderContainerSettings(state.draftSettingsContainer.id);
        handleSettingChange();
    }
};

export const handleAddQuickQuestion = (e: SubmitEvent) => {
    e.preventDefault();
    if (state.draftSettingsContainer && DOM.inputs.newQuickQuestion) {
        const newValue = DOM.inputs.newQuickQuestion.value.trim();
        if (newValue && !state.draftSettingsContainer.quickQuestions.includes(newValue)) {
            state.draftSettingsContainer.quickQuestions.push(newValue);
            renderContainerSettings(state.draftSettingsContainer.id);
            handleSettingChange();
        }
        (e.target as HTMLFormElement).reset();
    }
};

export const handleAddPersona = (e: SubmitEvent) => {
    e.preventDefault();
    if (state.draftSettingsContainer && DOM.inputs.newPersona) {
        const newValue = DOM.inputs.newPersona.value.trim();
        if (newValue && !state.draftSettingsContainer.availablePersonas.includes(newValue)) {
            state.draftSettingsContainer.availablePersonas.push(newValue);
            renderContainerSettings(state.draftSettingsContainer.id);
            handleSettingChange();
        }
        (e.target as HTMLFormElement).reset();
    }
};

export const handleAddAccessor = (e: SubmitEvent) => {
    e.preventDefault();
    if (state.draftSettingsContainer && DOM.inputs.newAccessor) {
        const newValue = DOM.inputs.newAccessor.value.trim();
        if (newValue && !state.draftSettingsContainer.accessControl.includes(newValue)) {
            state.draftSettingsContainer.accessControl.push(newValue);
            renderContainerSettings(state.draftSettingsContainer.id);
            handleSettingChange();
        }
        (e.target as HTMLFormElement).reset();
    }
};

export const handleSuggestQuestions = async () => {
    if (!state.draftSettingsContainer || !DOM.buttons.suggestQuestions) return;
    DOM.buttons.suggestQuestions.disabled = true;
    DOM.buttons.suggestQuestions.innerHTML = `<div class="spinner"></div>`;
    try {
        const suggestions = await generateSuggestions(state.draftSettingsContainer.name, 'questions');
        state.draftSettingsContainer.quickQuestions.push(...suggestions);
        renderContainerSettings(state.draftSettingsContainer.id);
        handleSettingChange();
    } catch (error) {
        showToast(error instanceof Error ? error.message : "An unknown error occurred.", 'error');
    } finally {
        DOM.buttons.suggestQuestions.disabled = false;
        DOM.buttons.suggestQuestions.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> Suggest with AI`;
    }
};

export const handleSuggestPersonas = async () => {
    if (!state.draftSettingsContainer || !DOM.buttons.suggestPersonas) return;
    DOM.buttons.suggestPersonas.disabled = true;
    DOM.buttons.suggestPersonas.innerHTML = `<div class="spinner"></div>`;
    try {
        const suggestions = await generateSuggestions(state.draftSettingsContainer.name, 'personas');
        state.draftSettingsContainer.availablePersonas.push(...suggestions);
        renderContainerSettings(state.draftSettingsContainer.id);
        handleSettingChange();
    } catch (error) {
        showToast(error instanceof Error ? error.message : "An unknown error occurred.", 'error');
    } finally {
        DOM.buttons.suggestPersonas.disabled = false;
        DOM.buttons.suggestPersonas.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> Suggest with AI`;
    }
};

export const handleGenerateFunction = async () => {
    if (!state.draftSettingsContainer || !DOM.inputs.newFunction || !DOM.buttons.generateFunction) return;
    const request = DOM.inputs.newFunction.value.trim();
    if (!request) return;

    DOM.buttons.generateFunction.disabled = true;
    DOM.buttons.generateFunction.innerHTML = `<div class="spinner"></div> Generating...`;
    try {
        const funcData = await generateFunction(request);
        const newFunc: AppFunction = {
            ...funcData,
            id: `func-${Date.now()}`,
            enabled: true,
        };
        state.draftSettingsContainer.functions.push(newFunc);
        renderContainerSettings(state.draftSettingsContainer.id);
        handleSettingChange();
        DOM.inputs.newFunction.value = '';
    } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to generate function.", 'error');
    } finally {
        DOM.buttons.generateFunction.disabled = false;
        DOM.buttons.generateFunction.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> Generate with AI`;
    }
};

// Global Settings Handlers
// =============================================================================

export const handleAddModel = (e: SubmitEvent) => {
    e.preventDefault();
    if (!state.draftAvailableModels || !DOM.inputs.newModelId || !DOM.inputs.newModelApi || !DOM.inputs.newModelIcon) return;
    const newModel = {
        id: DOM.inputs.newModelId.value.trim(),
        api: DOM.inputs.newModelApi.value.trim() as 'google',
        icon: DOM.inputs.newModelIcon.value.trim(),
    };
    if (newModel.id && newModel.api && newModel.icon && !state.draftAvailableModels.some(m => m.id === newModel.id)) {
        state.draftAvailableModels.push(newModel);
        renderModelManagementList();
        checkForGlobalSettingChanges();
    }
    (e.target as HTMLFormElement).reset();
};

export const handleDeleteModel = (modelId: string) => {
    if (state.draftAvailableModels) {
        state.draftAvailableModels = state.draftAvailableModels.filter(m => m.id !== modelId);
        renderModelManagementList();
        checkForGlobalSettingChanges();
    }
};


// Knowledge Base Handlers
// =============================================================================

const processFilesForKnowledgeBase = async (files: FileList | null) => {
    if (!files || files.length === 0 || !state.currentContainerId) return;
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container) return;

    showToast(`Uploading ${files.length} file(s)...`);
    for (const file of Array.from(files)) {
        if (container.knowledgeBase.some(kf => kf.name === file.name)) {
            showToast(`File "${file.name}" already exists.`);
            continue;
        }
        try {
            const base64Content = await fileToBase64(file);
            const newFile: KnowledgeFile = {
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                base64Content,
            };
            container.knowledgeBase.push(newFile);
        } catch (error) {
            showToast(`Could not process file: ${file.name}`, 'error');
        }
    }
    await saveState();
    renderKnowledgeFiles();
};

export const handleSharePointFilesForKnowledge = async (files: { siteId: string; itemId: string; name: string; mimeType: string; size: number }[]) => {
    if (files.length === 0 || !state.currentContainerId) return;
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container) return;

    showToast(`Downloading ${files.length} file(s)...`);
    closeModal(DOM.modals.sharepointPicker);

    for (const fileInfo of files) {
        if (container.knowledgeBase.some(kf => kf.name === fileInfo.name)) {
            showToast(`File "${fileInfo.name}" already exists.`);
            continue;
        }
        try {
            const knowledgeFile = await graph.downloadSharePointFile(fileInfo.siteId, fileInfo.itemId, fileInfo.name, fileInfo.mimeType, fileInfo.size);
            container.knowledgeBase.push(knowledgeFile);
        } catch (error) {
            console.error(`Error downloading SharePoint file ${fileInfo.name}:`, error);
            showToast(error instanceof Error ? error.message : `Failed to download ${fileInfo.name}.`, 'error');
        }
    }
    await saveState();
    renderKnowledgeFiles();
};

export const handleKnowledgeFileChange = async (files: FileList | null) => await processFilesForKnowledgeBase(files);
export const handleKnowledgeFileDrop = async (files: FileList | undefined) => await processFilesForKnowledgeBase(files || null);