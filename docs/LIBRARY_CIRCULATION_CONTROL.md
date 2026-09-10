# Library Circulation Control

The library domain now exposes a secure circulation workflow for school operations.

## Capabilities
- Book/copy ownership validation through school -> organization scope.
- Member borrowing limits from library policy.
- Issue and return transactions with atomic copy-state transitions.
- Automatic overdue state refresh and configurable grace periods.
- Renewal limits and reservation-aware renewal blocking.
- FIFO reservation fulfillment when the reserved member borrows a copy.
- Reservation creation/cancellation with duplicate protection.
- Fine creation and partial/full fine settlement with overpayment protection.
- Operational dashboard counts for titles, copies, active circulation, overdue items, reservations and outstanding fines.
- Search across title, author and ISBN within the authenticated school.
- Audit events for circulation, reservation and fine operations.

## Security
All management operations require JWT authentication and permission checks. School ownership is resolved server-side through the authenticated organization claim; client-supplied organization identifiers are never used as tenant authority.
