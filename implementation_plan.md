# Implementation Plan - NextGen Hiring

Build a full-stack job portal with AI-powered resume parsing, job matching, and mock interview capabilities.

## Proposed Changes

### [Backend]
Summary: Node.js/Express server with PostgreSQL integration and Gemini AI services.

#### [NEW] [server.js](file:///e:/Nextgen%20Hiring/backend/server.js)
Main entry point for the backend. Configures Express, middleware, and routes.
#### [NEW] [db.js](file:///e:/Nextgen%20Hiring/backend/db.js)
PostgreSQL connection pool and schema initialization.
#### [NEW] [.env](file:///e:/Nextgen%20Hiring/backend/.env)
Environment variables for database, JWT, and Gemini API.
#### [NEW] [Auth System](file:///e:/Nextgen%20Hiring/backend/controllers/authController.js)
JWT-based authentication and role-based access control.
#### [NEW] [AI Services](file:///e:/Nextgen%20Hiring/backend/controllers/resumeController.js)
Integration with Google Gemini for resume parsing and job matching.

---

### [Frontend]
Summary: React application using Vite and Tailwind CSS.

#### [NEW] [App.jsx](file:///e:/Nextgen%20Hiring/frontend/src/App.jsx)
Main component with React Router for dashboard and auth navigation.
#### [NEW] [Dashboards](file:///e:/Nextgen%20Hiring/frontend/src/pages/)
Separate dashboards for Job Finders, Job Posters, and Admins.
#### [NEW] [Styles](file:///e:/Nextgen%20Hiring/frontend/src/index.css)
Tailwind CSS configuration and global styles.

---

## Verification Plan

### Automated Tests
-   **Database**: Run `node db.js` to verify table creation and initial seed data.
-   **API**: Use `curl` or a test script to verify auth endpoints and job posting.

### Manual Verification
-   **User Flow**: Register as a Job Finder, upload a PDF resume, and verify AI skill extraction.
-   **Job Poster**: Post a job and verify it appears as "pending" in the Admin Dashboard.
-   **Admin**: Approve a job and verify it becomes visible to Job Finders.
-   **Mock Test**: Take a role-specific mock test and verify proctoring alerts (tab switching).
