# Final Project


Task Management App

Another fullstack react app.  Now i feel i have a solid grasp on what is needed for a small scale app.
Would be interesting to work on something for a longer period. 
I did try cutting corners using gridmight not hve been the best option but i thought it would save me time.

it did not. This is the last time i try to cut corners when coding lesson is learned.

Tech Stack

Frontend

React (with Vite for fast bundling)

Zustand (state management with persistence)

Material-UI (responsive, accessible UI components)

Axios (API communication)

Backend

Node.js + Express (RESTful API)

MongoDB (data storage)

GridFS (file storage)

Multer (file uploads)

Authentication

JWT (JSON Web Tokens for secure access)

Deployment

Netlify (frontend hosting)

Render (backend hosting)

Tasks are the core unit of this app and have full CRUD support.

Features:

Create Task: Users can create tasks with a title, description, due date, category, project association, and file attachments.

Update Task: Tasks can be updated to change details or add files; multiple files supported via Multer memory storage and stored in MongoDB GridFS.

Delete Task: Tasks can be deleted individually; tasks linked to a project update project completion automatically.

Completion Tracking: Tasks can be marked completed/uncompleted. The system also allows marking all tasks completed at once.

Filters & Queries: Tasks can be filtered by status (completed/uncompleted/all) or by creation date.

Implementation Details:

Zustand Store: The useTaskStore manages task and project state on the frontend, syncing with localStorage for offline persistence.

Project Auto-Completion: Whenever a task's completion state changes, the associated project's completion status is recalculated.

Backend Highlights:

API endpoints include POST /tasks, GET /tasks, PUT /tasks/:id, DELETE /tasks/:id

GridFS allows large or multiple files per task, streamed efficiently to clients.

Project Management

Projects group tasks and provide higher-level completion tracking.

Features:

Add/delete projects.

Associate tasks with projects.

Projects automatically reflect the completion percentage based on their tasks.

Implementation Details:

Projects are stored in useTaskStore alongside tasks, and updateProjectCompletion automatically calculates if all tasks in the project are complete.

When a project is deleted, all tasks linked to it are updated to remove the association.

Group Management

Groups allow collaborative work and task segregation.

Features:

Create, delete, join, leave groups.

Assign projects to groups.

View members and their task/project assignments.

Pagination and search support for large numbers of groups.

Frontend Implementation:

The GroupsManagement component handles all UI interactions for group management.

State is managed via useGroupStore (Zustand), fetching data from the backend.

Snackbars provide real-time feedback for actions like joining, leaving, or creating groups.

Backend Implementation:

Express routes handle all group operations (/groups, /groups/:id/join, /groups/:id/leave, etc.)

Protected by JWT auth middleware for security.

Frontend Features

Responsive & Accessible UI: Fully responsive layouts using Material-UI; ARIA roles on modals and dialogs for accessibility.

Dark Mode: Toggleable dark/light mode using Material-UI theme provider, with background images and color palettes adjusted dynamically.

Modals: Login, registration, and group management modals overlay the main content without breaking app flow.

Task & Project Dashboard: Summary panels show total tasks, uncompleted tasks, and project completion percentages in real-time.

State Management:

Zustand stores ensure all state changes (tasks, projects, groups, user info) update the UI reactively.

LocalStorage persistence allows offline resilience.

Backend Highlights

RESTful API Structure: Modular Express routes for tasks, groups, projects, and auth.

File Handling: Multer handles in-memory file uploads, streamed to MongoDB GridFS.

Authentication: JWT middleware protects sensitive routes, ensuring only authenticated users can access their group-specific tasks/projects.

Error Handling & Logging: Console logs and HTTP status codes used throughout for debugging and feedback.

Advanced Features & Architectural Decisions

State-driven UI: Zustand stores are the single source of truth for tasks, projects, groups, and user authentication.

Automatic Project Status: Projects reflect real-time task completion without manual updates.

Secure & Modular Backend: Auth middleware, modular route files, and GridFS for scalable file storage.

User Experience: Modals, snackbars, and responsive layout provide polished UX, with immediate feedback on all actions.

Future-Ready: Architecture allows easy integration of real-time updates via WebSockets or additional collaborative features.

Summary of my project

The project is a full-featured, modern task and project management system that balances frontend reactivity, backend security, and scalable architecture. It showcases:

Advanced state management with Zustand

JWT authentication

MongoDB + GridFS file handling

Group/project collaboration features

Responsive, accessible UI

It demonstrates full-stack proficiency, attention to UX, and scalable software design principles.