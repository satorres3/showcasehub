# ShowcaseHub

A scalable Chat + Knowledge Base portal.

## Quickstart

```bash
make setup                # Install backend dependencies
npm --prefix web install   # Install frontend dependencies
./start.sh                # Run backend and frontend together
```

The API will be available at http://127.0.0.1:8000/healthz.
The frontend will be available at http://127.0.0.1:5173/.

## Configuration

Copy the sample environment file and provide the required secrets:

```bash
cp .env.example .env
# then edit .env and set API_KEY, MSAL_CLIENT_ID, MSAL_TENANT_ID
```

Without these values, the frontend logs messages such as
`API_KEY environment variable not set. AI features will be disabled.` and
`MSAL configuration not found or incomplete from backend. Microsoft login will be disabled.`
