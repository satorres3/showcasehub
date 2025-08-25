# Project Development Phases

This document outlines the strategic development roadmap for the Hub Nice State AI Portal. Each phase builds upon the last, progressively enhancing the platform's capabilities, security, and user value.

---

### **Phase 1: Foundation & Core Functionality (Complete)**

**Goal:** Establish a robust, functional, and highly customizable single-page application (SPA) with core AI capabilities running entirely in the browser.

**Key Deliverables:**
- **Container-Based Architecture**: Implemented the core concept of isolated AI workspaces ("containers").
- **Dynamic UI Engine**: Created a framework-less UI system that loads pages and components dynamically from HTML partials.
- **Client-Side State Management**: Utilized `localStorage` for state persistence.
- **Deep Customization**: Enabled per-container configuration for branding, themes, personas, and quick questions.
- **AI-Powered Setup**: Integrated Google Gemini to provide intelligent suggestions for container creation.
- **Custom Functions**: Built the UI and logic for creating and running simple, prompt-based "Apps" or "Functions".
- **Client-Side Authentication**: Integrated Microsoft Authentication Library (MSAL) directly in the frontend for user login and Microsoft Graph API access.
- **Knowledge Base**: Implemented file uploads (local and SharePoint) for grounding AI responses.

---

### **Phase 2: Security Hardening & Backend Integration (Current Phase)**

**Goal:** Transition from a client-side-only architecture to a more secure and scalable model by implementing a Backend for Frontend (BFF) using serverless functions. This moves all secrets and sensitive operations to the server side.

**Key Deliverables:**
- **Serverless API Backend**: Create a set of Azure Functions to handle authentication and API proxying.
- **Backend Authentication Flow**: Rework the MSAL authentication to a secure server-side OAuth 2.0 flow.
  - The client will redirect to our API for login.
  - The API will handle the OAuth exchange with Microsoft.
  - Tokens will be stored in secure, `HttpOnly` cookies.
- **API Key Secrecy**: Move the Google Gemini `API_KEY` from the frontend environment to the serverless function environment. All AI calls will be proxied through our backend.
- **Graph API Proxy**: All Microsoft Graph API calls (e.g., for SharePoint) will be proxied through our backend, which will securely attach the necessary access tokens.
- **Secure Configuration**: All client IDs and secrets will be removed from the frontend code and moved exclusively to server-side configuration.
- **Early Observability**: Implement foundational logging and usage metrics (e.g., via Azure App Insights, OpenTelemetry, or Langfuse). This provides critical visibility into API calls and user interactions, paving the way for the feedback loops required in later phases.

---

### **Phase 3: Proactive Intelligence & Collaboration**

**Goal:** Evolve the AI from a reactive tool to a proactive, intelligent partner and introduce collaborative features. This phase introduces foundational Machine Learning capabilities to enhance response quality.

**Key Deliverables:**
- **Modular RAG Pipeline**: Implement a production-grade document ingestion and retrieval pipeline (Normalize, Parse, Chunk, Embed, Index) on the backend.
  - **Architectural Note**: This system will be designed with a clear separation of concerns between the backend RAG pipeline and the frontend assistant UX. This modularity will allow for future flexibility in swapping out components (e.g., embedding models, vector databases like Azure AI Search, Pinecone, or FAISS).
- **Advanced Function Calling**: Implement true Gemini function calling, allowing the AI to intelligently select and use tools (e.g., "Draft an email", "Look up user in CRM") based on conversation context.
- **Google Search Grounding**: Allow containers to be grounded with live Google Search results for real-time information, including proper citation of sources.
- **Conversation Summaries**: Add a feature for users to get on-demand summaries of long chat threads.
- **Shared Chats & Permalinks**: Enable users to generate a unique, read-only link to a conversation to share with colleagues.
- **Deeper Integrations**: Move beyond file access to actionable integrations (e.g., create a calendar event, draft a document in SharePoint) via the server-side Graph API proxy.

---

### **Phase 4: Departmental ML Insights & Optimization**

**Goal:** Leverage Machine Learning to provide actionable insights across various business functions and give administrators tools to monitor usage, gather feedback, and optimize the value of their AI containers.

**Key Deliverables:**
- **Cross-Departmental ML Solutions**: Expand beyond a sales-only focus to position the platform as a company-wide intelligent assistant.
    - **Sales**: Lead scoring, personalized cross-sell/upsell recommendations, and churn prediction.
    - **Human Resources**: Tools to identify patterns related to employee attrition risk.
    - **Finance**: Functions for invoice data extraction (OCR) and financial forecasting support.
    - **Operations**: Intelligent routing of support tickets based on semantic analysis.
- **Administrator Dashboard**: A new page showing usage analytics (e.g., most active containers, messages per day, popular functions).
- **Chat Ratings & Feedback**: Implement a simple "thumbs up/down" feedback mechanism on AI responses.
- **Container Templating**: Allow admins to save a container's configuration as a template to quickly deploy new, similar containers.

---

### **Phase 5: Governance, Ecosystem & Enterprise Readiness**

**Goal:** Prepare the platform for wide adoption within an enterprise, focusing on scalability, a rich ecosystem, and robust governance features, especially for regions with strict data compliance requirements.

**Key Deliverables:**
- **Advanced Governance & Compliance**:
    - **Role-Based Access Control (RBAC)**: Introduce granular permissions (e.g., "Container Admin," "Global Admin," "User").
    - **Data Residency Guarantees**: Architect the backend to support deployment in specific regions (e.g., Azure Germany, Frankfurt) to comply with data sovereignty regulations.
    - **Comprehensive Audit Logs**: Implement detailed logging for every AI call, recording who asked what, which data sources were retrieved, and when.
    - **Consent & Transparency**: Build features to ensure users are aware when they are interacting with an AI and provide clear information on how their data is used.
- **Advanced NLP & Intent Routing**: Use ML models to classify user intent (e.g., support, billing, sales) and route them to the correct tool or knowledge base.
- **Self-Monitoring & Evaluation**: Implement automated grading of AI response quality (e.g., using RAGAS) to create feedback loops for continuous improvement.
- **Voice & Sentiment Analysis**: Introduce functionality to analyze sales call transcripts for sentiment and provide feedback to reps.
- **Marketplace for Functions/Templates**: Create a shared space where users across an organization can publish and use container templates and custom functions.
- **CI/CD Pipelines**: Formalize deployment with automated testing and release pipelines.