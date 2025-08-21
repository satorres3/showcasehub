/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { getGraphToken } from './auth';
import { fileToBase64 } from './utils';
import type { KnowledgeFile } from './types';

const GRAPH_ENDPOINT_BASE = 'https://graph.microsoft.com/v1.0';
const GRAPH_SCOPES = {
    FILES_READ_ALL: "Files.Read.All",
};

async function graphFetch(endpoint: string) {
    const accessToken = await getGraphToken([GRAPH_SCOPES.FILES_READ_ALL]);
    if (!accessToken) {
        throw new Error("Authentication failed. Could not get access token for Microsoft Graph.");
    }
    const response = await fetch(`${GRAPH_ENDPOINT_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("Graph API Error:", error);
        throw new Error(`Graph API request failed: ${error.error?.message || response.statusText}`);
    }

    return response;
}

export async function getSharePointSites() {
    const response = await graphFetch('/sites?search=*');
    const data = await response.json();
    return data.value.map((site: any) => ({
        id: site.id,
        name: site.displayName,
        url: site.webUrl
    }));
}

export async function getDriveItems(siteId: string, itemId: string = 'root') {
    const response = await graphFetch(`/sites/${siteId}/drive/items/${itemId}/children?$select=id,name,webUrl,file,folder,size`);
    const data = await response.json();
    return data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        isFolder: !!item.folder,
        size: item.size,
        mimeType: item.file?.mimeType
    }));
}

export async function getDriveItemContent(siteId: string, itemId: string): Promise<string> {
    const response = await graphFetch(`/sites/${siteId}/drive/items/${itemId}/content`);
    const blob = await response.blob();
    return fileToBase64(new File([blob], "temp"));
}

export async function downloadSharePointFile(siteId: string, itemId: string, name: string, mimeType: string, size: number): Promise<KnowledgeFile> {
    const base64Content = await getDriveItemContent(siteId, itemId);
    return {
        name,
        type: mimeType,
        size,
        uploadDate: new Date().toISOString(),
        base64Content,
    };
}