# Team Reflection

## What We Built

SyncBoard is a full-stack, real-time Kanban board for personal and organizational workspaces. The project combines a React and Vite client with an Express and MongoDB backend, JWT authentication, Socket.io live updates, optimistic UI behavior, offline board caching, and conflict detection for concurrent edits.

## What Went Well

- We separated the application into clear frontend, backend, model, controller, route, and context layers.
- We implemented the core task lifecycle from creation through drag-and-drop status changes, editing, and deletion.
- Real-time updates and conflict handling address the collaboration problems that motivated the project.
- Automated frontend and backend tests cover authentication, boards, tasks, and conflict behavior.
- Docker and the CI workflow make the project easier to run consistently and validate before submission.

## Challenges and Lessons Learned

The most difficult part was coordinating state that can change from several places at once: local optimistic updates, cached offline data, REST responses, and Socket.io events. We learned that timestamps, explicit conflict responses, and a single shared board context make those transitions easier to reason about. We also learned that keeping test conventions consistent matters as much as adding coverage; duplicated tests and mixed test APIs create maintenance work without improving confidence.

## What We Would Improve

- Add an automatic background queue for offline mutations instead of requiring a reload to synchronize them.
- Add stronger end-to-end coverage for multi-user collaboration and reconnect behavior.
- Move production secrets and deployment-specific configuration entirely into environment management.
- Add file attachments and richer task history in a future iteration.

## Takeaway

The project gave us practical experience designing a collaborative MERN application where persistence, real-time communication, authentication, and failure states all need to work together. The next quality improvement is to keep the codebase and its documentation as deliberate as the product itself.
