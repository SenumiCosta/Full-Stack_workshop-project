# Full-Stack Workshop Project

## API Endpoints (v1)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login user and get JWT | No |
| GET | /api/boards | Get all boards for user | Yes |
| POST | /api/boards | Create a new board | Yes |
| PUT | /api/boards/:id | Update board name | Yes |
| DELETE | /api/boards/:id | Delete a board | Yes |
| GET | /api/boards/:boardId/tasks | Get all tasks for a board | Yes |
| POST | /api/boards/:boardId/tasks | Create a new task | Yes |
| PUT | /api/tasks/:id | Update a task | Yes |
| DELETE | /api/tasks/:id | Delete a task | Yes |