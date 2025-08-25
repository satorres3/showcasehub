# Hub Nice State: The Container-Based AI Portal

## Overview

Hub Nice State is a sophisticated, container-based AI portal designed for organizations to create, manage, and deploy specialized AI assistants. The platform allows administrators to build isolated "containers" or "workspaces," each tailored to a specific department, product, or function (e.g., Data Security, Sales, HR).

The application is architected as a modern Static Web App, featuring a fast, dynamic frontend built with TypeScript and a secure, serverless backend that handles authentication and all communication with external AI and Microsoft Graph services. This **Backend for Frontend (BFF)** pattern ensures that no secrets or sensitive tokens are ever exposed to the browser, providing enterprise-grade security.

## Key Features

- **Container-Based Architecture**: Create isolated workspaces for different teams or purposes. Each container has its own unique configuration.
- **Deep Customization**:
    - **Branding & Appearance**: Customize everything from login page text and logos to the specific colors of the chat interface for each container.
    - **Knowledge Base**: Upload files (PDFs, text, images) to provide each container's AI with a unique, private knowledge base for grounded, accurate responses.
    - **SharePoint Integration**: Securely connect to SharePoint to add files to the knowledge base or attach them directly to chats.
    - **Personas & Quick Questions**: Define the AI's personality and pre-populate the chat with relevant, context-aware starter questions.
- **Multi-Model Support**: Manage a central repository of AI models from various providers (e.g., Google Gemini, Groq). Administrators can assign specific models to each container.
- **AI-Powered Configuration**: The application uses AI to assist administrators in setting up new containers by suggesting descriptions, personas, quick questions, and even custom functions based on a simple name and type.
- **Custom Functions (Apps)**: Define custom, AI-powered tools within a container. Describe a task (e.g., "draft an outreach email"), and the AI will generate a tool with the necessary inputs and prompt templates.
- **Secure Backend Authentication**: A server-side flow using Microsoft Authentication Library (MSAL) provides secure, enterprise-grade user login. All tokens are handled on the backend and stored in `HttpOnly` cookies.
- **Dynamic UI**: A responsive, modern interface built with TypeScript and vanilla web components, ensuring a fast and seamless user experience without a heavy framework dependency.

---

## Project Roadmap

This project is developed in distinct phases. For a detailed breakdown of each phase, including our vision for integrating advanced Machine Learning, please see the `phases.md` file.

- **Phase 1: Foundation & Core Functionality (Complete)**
- **Phase 2: Security Hardening & Backend Integration (Current)**
- **Phase 3: Proactive Intelligence & Collaboration**
- **Phase 4: Sales Enablement & ML-Powered Insights**
- **Phase 5: Ecosystem & Enterprise Readiness**

**Status: We are here (Phase 2).**

---

## Technology Stack

- **Frontend**: TypeScript, HTML5, CSS3 (No framework)
- **AI Integration**: `@google/genai` (Google Gemini API)
- **Authentication & Graph API**: `@azure/msal-browser` (Microsoft Authentication Library)
- **Tooling**: Vite (for development server and build process)
- **Styling**: Modern CSS with Custom Properties (Variables) for theming.
- **Modules**: Native ES Modules managed via Vite.

## Getting Started (Local Development)

To run this project locally, you need Node.js and npm installed.

1.  **Clone or Download**: Get the code onto your local machine.

2.  **Install Dependencies**: Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**: Create a file named `.env` in the root of the project. This file is for your local secrets and should not be committed to version control. See the **Configuration** section below for the required variables.

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    This will start a local server, typically at `http://localhost:5173`. The application will open in your browser and will automatically reload when you make changes to the code.


## Configuration

This application is designed to fetch its configuration from a backend service, making it suitable for secure production environments.

### Authentication (MSAL) & AI Services

The configuration for external services (Microsoft Authentication and Google AI) is managed via environment variables.

**For Local Development:**
To run the app locally, create a `.env` file in the root project directory.

**Required Environment Variables:**

- `API_KEY`: Your API key for the Google AI (Gemini) service.
- `MSAL_CLIENT_ID`: The Application (client) ID for your Microsoft Entra (Azure AD) app registration.
- `MSAL_TENANT_ID`: The Directory (tenant) ID for your Microsoft Entra (Azure AD) app registration.

**Required API Permissions (Azure AD App):**
In your Azure AD App Registration, you must grant the following **Delegated** permissions for the **Microsoft Graph** API:
- `User.Read` (for user profile information)
- `Files.Read.All` (for SharePoint integration)

**Example `.env` file:**

```
API_KEY="AIzaSy...your...google...api...key..."
MSAL_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MSAL_TENANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Deployment to Azure

This project is configured for deployment to **Azure Static Web Apps (SWA)**.

### Azure SWA Build Configuration

When creating your Static Web App in the Azure Portal, use the following **Build Details**:

- **Build Presets**: `Custom`
- **App location**: `/`
- **Api location**: (leave blank)
- **Output location**: `dist`

The `Output location` must be set to `dist`. This tells Azure to serve the compiled application files generated by the `npm run build` command, not the raw source code. This is the most common cause of deployment errors.

### Azure SWA Configuration File

This repository includes a `staticwebapp.config.json` file. This is the official way to configure the SWA service and is critical for the application to function correctly.

- **`navigationFallback`**: This rule directs all routes that are not specific files (like `/hub` or `/settings/some-id`) to `index.html`. This allows our client-side single-page application to handle its own routing.
- **`mimeTypes`**: This ensures that files are served with the correct `Content-Type` header (e.g., `.js` files are served as `text/javascript`), which fixes the "octet-stream" error you may encounter.

### Production Environment Variables

In the Azure Portal, navigate to your Static Web App resource and go to **Configuration**. Add your `API_KEY`, `MSAL_CLIENT_ID`, and `MSAL_TENANT_ID` as **Application settings**. These will be securely provided to your application at runtime.

## Troubleshooting

- **AI features disabled**: If the browser console logs `API_KEY environment variable not set. AI features will be disabled.`,
  ensure `API_KEY` is defined in your `.env` file.
- **Microsoft login disabled**: A warning `MSAL configuration not found or incomplete from backend. Microsoft login will be disabled.`
  indicates that `MSAL_CLIENT_ID` or `MSAL_TENANT_ID` is missing.
