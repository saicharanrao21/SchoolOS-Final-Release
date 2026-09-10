# Events & PTM Operations Hardening

The Events and Parent-Teacher Meeting modules enforce authenticated organization scope server-side.

## Events
- School ownership is checked against the authenticated organization when creating and reading events.
- Registration validates publication and registration windows and prevents duplicate active registrations.
- Capacity counts only active registrations.
- Authorized staff can publish, cancel, complete, and mark participant attendance.
- Registration cancellation is scoped to the requesting user's organization.

## PTM
- PTM events require an active school belonging to the authenticated organization.
- Bulk slots require active teachers from the same school and reject overlapping teacher slots.
- Guardians can book only students linked to their guardian profile and only within their school.
- A guardian cannot hold multiple confirmed bookings for the same PTM event.
- Available slots and meeting lists are organization-scoped.
