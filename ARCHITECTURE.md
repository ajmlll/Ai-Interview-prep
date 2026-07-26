# Architecture Documentation - AI Interview Preparation Platform

This document describes the codebase structure, shared data models, and API routing conventions for the AI Interview Preparation Platform.

## 1. Folder Structure

The project is organized as a MERN monorepo using **npm workspaces**:

```
/
├── client/              # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/       # Page components (Dashboard, Login, etc.)
│   │   ├── App.tsx      # Routing and main application layout
│   │   └── main.tsx     # SPA entrypoint
│   └── package.json
│
├── server/              # Express API (TypeScript + Node)
│   ├── src/
│   │   ├── controllers/ # Request controllers (stubbed)
│   │   ├── middlewares/ # Express middlewares (stubbed auth)
│   │   ├── routes/      # Express routing declarations
│   │   └── index.ts     # Server startup and MongoDB connection setup
│   ├── .env.example     # Environment variables template
│   └── package.json
│
├── shared/              # Shared Typescript Types/Interfaces
│   ├── src/
│   │   └── types.ts     # Data model definitions used by both client & server
│   └── package.json
│
├── ARCHITECTURE.md      # This file
└── package.json         # Root configuration for workspaces and development runner
```

---

## 2. Shared Data Models

All models are defined in [shared/src/types.ts](file:///c:/Users/muham/OneDrive/Desktop/Ai-Interviewprep/Ai-Interview-prep/shared/src/types.ts) and shared across client and server workspaces:

### User
Represents a user registered on the platform.
* `id`: string (Unique user identifier)
* `email`: string (User's login email)
* `name`: string (User's display name)
* `role`: `'user' | 'admin'` (User permissions level)
* `createdAt`: string (ISO datetime string)
* `updatedAt`: string (ISO datetime string)

### Question
Represents an interview question generated or selected for an interview.
* `id`: string (Unique question identifier)
* `text`: string (The actual question text)
* `category`: string (e.g., "Behavioral", "Technical")
* `difficulty`: `'easy' | 'medium' | 'hard'`
* `sampleAnswer`: string (Optional helper guide)

### FeedbackResult
Represents the AI feedback details for a completed interview.
* `overallScore`: number (Overall score evaluated out of 100)
* `detailedFeedback`: string (Summary feedback markdown)
* `questionWiseScore`: Array of question feedback details:
  * `questionId`: string (Reference to Question id)
  * `score`: number (Score for the specific response)
  * `feedback`: string (Specific tips or evaluation)

### Interview
Represents a mock interview session.
* `id`: string (Unique interview identifier)
* `userId`: string (Reference to the user who took the interview)
* `title`: string (Descriptive title)
* `status`: `'pending' | 'in_progress' | 'completed' | 'failed'` (Session status)
* `questions`: Question[] (List of questions assigned to the session)
* `feedback`: FeedbackResult (Optional evaluation once completed)
* `createdAt`: string
* `updatedAt`: string

### ResumeDoc
Represents a resume uploaded and parsed.
* `id`: string (Unique identifier)
* `userId`: string (Reference to user)
* `fileName`: string (Name of uploaded document)
* `fileUrl`: string (Storage location of resume)
* `parsedText`: string (Optional text content extracted)
* `skills`: string[] (Skills recognized from parsing)
* `experienceYears`: number (Estimated years of experience parsed)
* `createdAt`: string
* `updatedAt`: string

---

## 3. REST API Route Naming Convention

All API endpoints must follow the RESTful naming structure prefixed with `/api/v1/<resource>`:

### Auth Endpoints (`/api/v1/auth`)
* `POST /api/v1/auth/register` — Create a user account
* `POST /api/v1/auth/login` — Login user & return tokens
* `POST /api/v1/auth/refresh` — Refresh authentication session
* `POST /api/v1/auth/logout` — Revoke session token

### Interview Endpoints (`/api/v1/interviews`)
* `GET /api/v1/interviews` — List mock interviews for logged-in user
* `POST /api/v1/interviews` — Create a new interview session
* `GET /api/v1/interviews/:id` — Get interview status & details
* `POST /api/v1/interviews/:id/start` — Start/resume an interview session
* `POST /api/v1/interviews/:id/submit` — Submit answers and finalize interview

### Resume Endpoints (`/api/v1/resumes`)
* `POST /api/v1/resumes` — Upload and parse a new resume document
* `GET /api/v1/resumes` — List uploaded resume records for the user
* `GET /api/v1/resumes/:id` — Get a specific resume's details and parsed keywords

### Admin Endpoints (`/api/v1/admin`)
* `GET /api/v1/admin/stats` — System usage metrics
* `GET /api/v1/admin/users` — List and manage users
* `GET /api/v1/admin/interviews` — Audit all interviews across system

### User Endpoints (`/api/v1/users`)
* `GET /api/v1/users/profile` — Fetch user's profile details
* `GET /api/v1/users/progress` — Fetch aggregate statistics on user completion rates
