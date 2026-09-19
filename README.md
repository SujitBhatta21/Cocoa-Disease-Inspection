# Cocoa Disease Inspection Platform

A full-stack cocoa disease inspection platform that combines ONNX computer
vision inference with a human review workflow. Approved field users can upload
images, review model detections, correct predictions, and save confirmed
inspections. Organisation administrators can monitor inspection activity,
approve or reject signup requests, create additional administrators, and export
inspection data for future model improvement.

## Architecture

![Simple component architecture](client/src/assets/SimpleComponentDiagram.png)

The application consists of:

- A React and TypeScript client built with Vite and Tailwind CSS.
- A FastAPI backend providing authentication, inference, inspection, and admin
  endpoints.
- PostgreSQL for organisations, users, account status, and inspection metadata.
- Azure Blob Storage for submitted inspection images.
- A YOLO26n model exported to ONNX for server-side inference.

## Features

### Authentication and account management

- Public organisation-based user signup.
- JWT bearer-token authentication and Argon2 password hashing.
- Role-based routes for users and administrators.
- New users enter a `pending` state and cannot sign in until approved.
- Administrators can review multiple pending users, select `approved`,
  `rejected`, or `pending`, and submit all status changes in one API request.
- Authenticated users can change their password after confirming their current
  password.
- Administrators can create another approved administrator within their own
  organisation.

### Cocoa inspection workflow

- JPEG and PNG upload validation.
- YOLO inference using ONNX Runtime.
- Detection classes, confidence scores, and bounding boxes.
- Confirmation modal displaying the strongest detection.
- Required human correction for low-confidence results and optional correction
  for other results.
- Confirmed images uploaded to an organisation-specific Azure Blob container.
- Inspection metadata stored in PostgreSQL.

### Admin dashboard

- Organisation-level inspection table.
- Total-user, inspection, corrected-inspection, and pending-user summaries.
- Pending signup approval table with bulk status updates.
- Inspection image links, final labels, confidence, review state, and submission
  dates.
- CSV export for the organisation's inspection dataset.

### Deployment

- A backend Dockerfile is available at `server/Dockerfile`.
- The Vite client can be deployed independently as a static application.
- CORS is configured for local development and the deployed frontend.

## Current status

### Completed

- YOLO26n training and ONNX export.
- ONNX image preprocessing, inference, and detection output.
- React upload, preview, diagnosis, and confirmation flow.
- PostgreSQL models and asynchronous SQLAlchemy sessions.
- JWT login and role-protected frontend routes.
- Pending-user signup and organisation-admin approval workflow.
- Bulk account-status update API.
- User password-change flow.
- Azure Blob Storage image uploads.
- Persisted inspections and human corrections.
- Organisation admin dashboard and CSV export.
- Backend Docker image configuration.
- Health endpoint and FastAPI-generated API documentation.

### Planned

- User deactivation and carefully managed account deletion.
- Azure Blob cleanup when inspection or user data is permanently deleted.
- Automated backend and frontend test suites.
- Database migrations.
- Improved audit logging for administrative actions.
- Automated dataset preparation and model retraining.

## Repository structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── ChangePassword.tsx
│   │   │   └── Form.tsx
│   │   ├── page/
│   │   │   ├── admin.tsx
│   │   │   ├── home.tsx
│   │   │   └── upload.tsx
│   │   ├── App.tsx
│   │   └── ProtectedRoute.tsx
│   └── package.json
└── server/
    ├── Dockerfile
    ├── main.py
    ├── pyproject.toml
    └── src/
        ├── api/
        │   ├── auth.py
        │   ├── inspect.py
        │   └── submissions.py
        ├── db/
        │   ├── seed.py
        │   └── session.py
        ├── services/
        │   ├── auth_service.py
        │   ├── inference_service.py
        │   └── storage_service.py
        ├── app.py
        ├── models.py
        ├── role.py
        └── schemas.py
```

## Running locally

### Prerequisites

- Python 3.13
- [uv](https://docs.astral.sh/uv/)
- Node.js and npm
- PostgreSQL
- An Azure Storage account or Azure credentials with Blob Storage access

### Environment variables

Create a `.env` file at the repository root for the backend:

```env
SECRET_KEY=replace-with-a-long-random-secret
DATABASE_URL_PRODUCTION=postgresql+asyncpg://user:password@localhost:5432/cocoa_inspection
STORAGE_ACCOUNT_NAME=your-storage-account-name
```

The Blob Storage service uses `DefaultAzureCredential`. For local development,
authenticate with Azure CLI or provide credentials supported by the Azure
Identity library. Do not commit secrets or the `.env` file.

Create `client/.env` for the frontend:

```env
VITE_SERVER_URL=http://127.0.0.1:8000
```

### Start the backend

```bash
cd server
uv sync
uv run python main.py
```

The API will be available at `http://127.0.0.1:8000`. Useful development URLs:

- Health check: `http://127.0.0.1:8000/health`
- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

### Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` by default.

## Main API endpoints

| Method  | Endpoint                                      | Purpose                                      |
| ------- | --------------------------------------------- | -------------------------------------------- |
| `GET`   | `/health`                                     | Service health check                         |
| `POST`  | `/api/v1/auth/token`                          | Authenticate and obtain a JWT                |
| `POST`  | `/api/v1/auth/signup/user`                    | Create a pending user account                |
| `POST`  | `/api/v1/auth/signup/admin`                   | Create an admin in the current organisation  |
| `GET`   | `/api/v1/auth/current_user`                   | Retrieve the authenticated user's profile   |
| `PATCH` | `/api/v1/auth/user/status`                    | Submit bulk pending-user status changes      |
| `PATCH` | `/api/v1/auth/change_password`                | Change the authenticated user's password     |
| `POST`  | `/api/v1/inspect`                             | Run inference on an uploaded image           |
| `POST`  | `/api/v1/submission`                          | Store a confirmed inspection and its image   |
| `GET`   | `/api/v1/submission/retrieve_org_inspections` | Retrieve admin dashboard data                |

### Bulk signup approval payload

The admin approval endpoint accepts all locally selected changes in one request:

```json
{
  "updates": [
    {
      "user_id": "00000000-0000-0000-0000-000000000000",
      "status": "approved"
    },
    {
      "user_id": "11111111-1111-1111-1111-111111111111",
      "status": "rejected"
    }
  ]
}
```

Valid statuses are `pending`, `approved`, and `rejected`.

### Password change payload

```json
{
  "current_password": "current password",
  "new_password": "new password"
}
```

Both protected endpoints require an `Authorization: Bearer <token>` header.

## Docker

Build the backend image from the repository root:

```bash
docker build -t cocoa-inspection-api ./server
```

Run the container with the required environment configuration:

```bash
docker run --env-file .env -p 8000:8000 cocoa-inspection-api
```

PostgreSQL and Azure Blob Storage are external services and are not bundled in
the backend image. When deploying, configure secrets through the hosting
platform and set `VITE_SERVER_URL` to the deployed backend URL when building the
frontend.

## Technology stack

| Category         | Technologies                           |
| ---------------- | -------------------------------------- |
| Machine learning | YOLO26n, ONNX, ONNX Runtime, Pillow    |
| Backend          | FastAPI, Pydantic, SQLAlchemy, asyncpg |
| Authentication   | JWT, Argon2                             |
| Database         | PostgreSQL                             |
| Frontend         | React, TypeScript, Vite, Tailwind CSS  |
| Cloud storage    | Azure Blob Storage, Azure Identity     |
| Deployment       | Docker, Vercel-ready static frontend   |
| Version control  | Git and GitHub                         |

## Long-term goal

Build a production-style AI inspection platform that demonstrates the complete
lifecycle of an AI system: model training, optimisation, cloud deployment,
real-time inference, human feedback, curated dataset export, and continual model
improvement.

## Acknowledgement of AI use

AI assistance was used to help draft and update this README from the project's
implemented features and roadmap.
