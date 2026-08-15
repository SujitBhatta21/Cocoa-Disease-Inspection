# Cocoa Disease Inspection Platform

A cloud-native AI inference platform for real-time cocoa disease detection. The
system enables field inspectors to capture images of cocoa leaves or pods,
perform fast object detection using a YOLO ONNX model, store inspection data in
the cloud, and collect human corrections to continuously improve future models.

The project demonstrates an end-to-end AI engineering workflow, combining
computer vision, cloud infrastructure, backend APIs, frontend development, and
MLOps concepts into a production-style application.

---

## Architecture

```text
                     Field Inspector
                           │
               React Progressive Web App
                           │
                     Upload Image
                           │
                      FastAPI API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ONNX Runtime      Azure Blob Storage   PostgreSQL
   YOLO26n Model      Original Images     Predictions
        │                                     │
        └───────────────┬─────────────────────┘
                        │
                Admin Dashboard
                        │
         Human Corrections & Dataset Export
                        │
                  Model Retraining
```

---

## Features

### AI Inference

- YOLO26n object detection model trained using PyTorch
- Exported to ONNX Runtime for efficient CPU inference
- Real-time disease detection from uploaded images
- Bounding boxes, confidence scores, and disease classes

### Backend

- FastAPI REST API
- PostgreSQL persistence
- SQLAlchemy ORM
- Pydantic request/response validation
- ONNX Runtime inference service
- Azure Blob Storage integration

### Frontend

- React Progressive Web App (PWA)
- Mobile-friendly inspection interface
- Camera integration
- Real-time diagnosis display
- Human correction workflow

### Cloud & Deployment

- Docker containerisation
- Azure Blob Storage
- Azure Database for PostgreSQL
- Azure Container Apps deployment

### MLOps

- Human-in-the-loop corrections
- Low-confidence review workflow
- Dataset export for retraining
- Continuous model improvement pipeline

---

## Current Progress

### ✅ Completed

- YOLO26n model trained
- ONNX model exported
- FastAPI project structure
- PostgreSQL integration
- Database models
- Image upload validation
- Health endpoint

### 🚧 In Progress

- ONNX inference pipeline
- Detection post-processing
- Blob Storage integration
- Inspection endpoint
- React inspection interface

### 📅 Planned

- Admin dashboard
- Human correction workflow
- Dataset export
- Azure deployment
- Docker containerisation

---

## Backend Structure

```text
server/
├── main.py
└── src/
    ├── app.py
    ├── api/
    │   └── inspect.py
    ├── core/
    │   └── inference_service.py
    ├── database.py
    ├── models.py
    └── schema.py
```

The project intentionally follows a lightweight FastAPI structure. Additional
layers (repository/service abstractions) will only be introduced when the
business logic becomes sufficiently complex to justify them.

---

## Running Locally

Start PostgreSQL:

```bash
docker compose up -d db
```

Start the backend:

```bash
cd server

uv sync

uv run python main.py
```

Health check:

```bash
curl http://localhost:8000/health
```

Inspect endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/inspect \
  -F "image=@/path/to/image.jpg"
```

---

## Project Roadmap

### Phase 1 – AI Inference

- Load ONNX model once during application startup
- Image preprocessing
- YOLO inference
- Non-Maximum Suppression (NMS)
- Detection formatting

### Phase 2 – Backend Services

- Save uploaded images to Azure Blob Storage
- Store predictions in PostgreSQL
- Human correction endpoint
- Inspection history API

### Phase 3 – Frontend

- Mobile inspection interface
- Camera integration
- Diagnosis display
- Correction interface

### Phase 4 – Cloud Deployment

- Docker image
- Azure Container Apps
- Azure Blob Storage
- Azure PostgreSQL

### Phase 5 – Continuous Learning

- Admin dashboard
- Review low-confidence detections
- Export corrected datasets
- Retrain YOLO model with new labelled data

---

## Technology Stack

| Category         | Technologies                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| Machine Learning | PyTorch, YOLO26n, ONNX Runtime                                          |
| Backend          | FastAPI, SQLAlchemy, Pydantic                                           |
| Database         | PostgreSQL                                                              |
| Frontend         | React, TypeScript                                                       |
| Cloud            | Azure Blob Storage, Azure Container Apps, Azure Database for PostgreSQL |
| DevOps           | Docker                                                                  |
| Version Control  | Git, GitHub                                                             |

---

## Long-Term Goal

Build a production-style AI inspection platform that demonstrates the complete
lifecycle of an AI system—from model training and optimisation to cloud
deployment, real-time inference, human feedback, and continual model
improvement.

## Acknowledgement USE of AI

`USED AI to draft the Readme based on bullet points I had set up from my previous README`
