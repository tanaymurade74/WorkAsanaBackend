# WorkAsana – Backend

A REST API for a team task and project management app. It handles authentication, projects, teams, tasks, and reporting, built with Express, Node.js, MongoDB, and JWT-based auth.

## Quick Start

```bash
git clone https://github.com/tanaymurade74/WorkAsanaBackend.git
cd WorkAsanaBackend
npm install
```

Create a `.env` file in the project root:

```env
MONGODB=your_mongodb_connection_string
```

Then start the server:

```bash
node index.js     # runs on http://localhost:3001
```

## Technologies

* Node.js
* Express
* MongoDB
* Mongoose
* JWT (jsonwebtoken)
* bcrypt

## Features

**Authentication**

* User signup and login with JWT
* Passwords hashed with bcrypt
* All project/team/task/report routes are protected (require a Bearer token)

**Projects & Teams**

* Create, list, view, and delete projects
* Create, list, view, update, and delete teams (with members)
* Deleting a project removes its tasks; deleting a team unassigns its tasks

**Tasks**

* Create, list, view, update, and delete tasks
* Filter tasks by owner or by project
* Status workflow: To Do, In Progress, Completed, Blocked

**Reports**

* Tasks completed in the last 7 days
* Pending work with total estimated days
* Closed tasks grouped by team, project, and owner

## API Reference

Base URL: the live API above, or `http://localhost:3001`. All routes except `/auth/signup` and `/auth/login` require an `Authorization: Bearer <token>` header.

### POST /auth/signup
Register a new user. Body: `name`, `email`, `password`.
Sample Response: `{ message, User: { id, name, email } }`

### POST /auth/login
Log in and receive a token. Body: `email`, `password`.
Sample Response: `{ message, token, User: { id, name, email } }`

### GET /auth/me
Get the logged-in user (from token).
Sample Response: `{ User: { _id, name, email } }`

### GET /tasks
List all tasks.
Sample Response: `{ Task: [ { _id, name, project, team, status, ... } ] }`

### POST /tasks
Create a task. Body: `name`, `project`, `team`, `owners`, `timeToComplete`, `tags`, `status`.
Sample Response: `{ Message: "Task Created", Task: { ... } }`

### GET /tasks/taskDetail/:taskId
Get a single task by ID. Sample Response: `{ Task: { ... } }`

### GET /tasks/:ownerId
List tasks owned by a user. Sample Response: `{ Task: [ ... ] }`

### GET /tasks/project/:projectId
List tasks for a project. Sample Response: `{ Tasks: [ ... ] }`

### PATCH /tasks/:taskId
Update a task (e.g. status). Sample Response: `{ Message: "Task status updated", Task: { ... } }`

### DELETE /tasks/:taskId
Delete a task. Sample Response: `{ Message: "Task deleted successfully." }`

### GET /projects · POST /projects · GET /projects/:projectId · DELETE /projects/:projectId
List, create, view, and delete projects.
Sample Response: `{ Projects: [ { _id, name, description } ] }`

### GET /teams · POST /teams · GET /teams/:teamId · PATCH /teams/:id · DELETE /teams/:teamId
List, create, view, update, and delete teams.
Sample Response: `{ Teams: [ { _id, name, members } ] }`

### GET /users · GET /users/:userId
List all users or fetch one by ID.
Sample Response: `{ Users: [ { _id, name, email } ] }`

### GET /report/lastWeek
Tasks completed in the last 7 days. Sample Response: `{ Tasks: [ ... ] }`

### GET /report/pending
Pending tasks and total estimated days. Sample Response: `{ totalDays, Tasks: [ ... ] }`

### GET /report/closedTasks
Completed tasks grouped by team, project, and owner.
Sample Response: `{ byTeam: { ... }, byProject: { ... }, byOwner: { ... } }`
