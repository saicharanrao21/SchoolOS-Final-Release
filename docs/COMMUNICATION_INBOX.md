# Communication Inbox

SchoolOS now provides an audited two-way communication thread layer for parent, teacher, student and school conversations.

## Guarantees
- Every thread is scoped to an organization and school.
- Users can only read threads where they are participants.
- Archived threads cannot receive new messages.
- Student context is validated against the selected school.
- Participant accounts must belong to the same organization.
- Read state is tracked per participant.
- Create/send/archive actions are audit logged and emit domain events.

## API
- `GET /communications/threads?schoolId=...`
- `POST /communications/threads`
- `GET /communications/threads/:id?schoolId=...`
- `POST /communications/threads/:id/messages`
- `POST /communications/threads/:id/read`
- `PATCH /communications/threads/:id/archive`
