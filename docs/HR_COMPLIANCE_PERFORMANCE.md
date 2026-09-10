# HR Compliance, Performance & Development

The HR domain now includes employee compliance documents, expiry monitoring, performance reviews and professional-development training. All records are school-scoped and every organization boundary is resolved server-side from the authenticated organization claim.

## Controls
- Employee ownership is checked before document/training writes.
- Reviewers must belong to the same school and cannot review themselves.
- Review ratings are constrained to 0–5.
- Completed/cancelled reviews are immutable.
- Expiring documents are queryable for operational reminders.
- Audit events are emitted for sensitive HR changes.
