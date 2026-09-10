# Fee Collection Operations

SchoolOS now provides a school-scoped receivables control layer on top of the existing fee structures, demands, concessions, payments and accounting ledger.

## Capabilities
- Late-fee rules: fixed, percentage, or daily fixed with grace days and optional caps.
- Overdue processing is idempotent: only the incremental late fee is added when a rule has already been applied.
- Receivables ageing buckets: current, 1–30, 31–60, 61–90 and 90+ days.
- Reminder queue with SMS, WhatsApp, email and push channels.
- Guardian recipient resolution from the existing authorized guardian relationship.
- Finance events feed the existing notification/realtime architecture.
- Organization and school ownership is validated server-side.

## Production note
Provider delivery remains behind the existing notification gateway/provider abstraction. This module queues reminder intent; provider credentials and live delivery are configured separately.
