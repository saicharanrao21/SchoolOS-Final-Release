# Enterprise Bank Reconciliation

SchoolOS now supports a controlled bank reconciliation workflow for school finance teams.

## Capabilities
- Import statement headers and transactions.
- Keep statements strictly scoped to the authenticated organization and school.
- Match statement credits to successful fee payments manually or through conservative auto-match rules.
- Prevent over-reconciliation and duplicate payment/statement matches.
- Mark non-payment movements as excluded with an audit trail.
- Block statement closure while unresolved or partially matched transactions remain.
- Track match method and confidence.
- Provide reconciliation KPIs for finance operations.

## Security
All organization and school ownership is resolved server-side. Payment candidates are restricted to successful payments belonging to students in the same school. Reconciliation actions are audit logged.

## Production integration
The import API intentionally accepts normalized transaction records. A future bank/open-banking connector can feed this boundary without changing the reconciliation engine.
