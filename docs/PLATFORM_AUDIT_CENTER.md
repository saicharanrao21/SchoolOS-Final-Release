# Platform Audit Center

SchoolOS now exposes a protected platform audit query surface for operational and security review.

## Capabilities
- Tenant-scoped audit search using the authenticated organization context.
- Action, resource, actor, school, severity and time-window filtering.
- Pagination with a maximum page size of 100.
- Summary counters for total, today's, high-severity and critical events.
- Actor/school context and correlation IDs for incident tracing.
- Existing AuditService remains the single write path; this feature adds read/search capabilities only.

## Security
The endpoint requires `platform.audit.read` and JWT/permission guards. The organization ID is taken from the authenticated JWT rather than request input, preventing cross-tenant audit enumeration.
