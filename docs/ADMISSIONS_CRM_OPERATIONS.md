# Admissions CRM Operations

The admissions enquiry layer now provides a school-scoped operational CRM over the existing enquiry/application pipeline.

## Capabilities
- Enquiry lifecycle and source reporting
- Follow-up scheduling and completion
- Outcome-driven enquiry progression
- Next-follow-up scheduling
- Overdue and next-24-hour follow-up queue
- Application/enrolment conversion KPIs
- Source conversion distribution
- Server-side organization and school ownership validation
- Audit and domain events for enquiry/follow-up operations

All reporting endpoints derive organization scope from the authenticated JWT and validate an optional school filter against that organization.
