# Accounting — Bank Reconciliation Control

The accounting layer now includes a bank reconciliation control that bridges imported bank statements with recorded school fee payments.

## Controls

1. **Statement import** — normalized statement headers and transactions are stored against one school bank account.
2. **Automatic matching** — successful fee payments are considered only when the amount and transaction date are compatible; exact references receive higher confidence.
3. **Manual matching** — finance staff can explicitly match a bank transaction to a payment.
4. **Partial matching** — split/partial settlement is supported without allowing the bank transaction or payment to be over-reconciled.
5. **Exclusions** — bank charges and non-school movements can be excluded with a reason and audit event.
6. **Controlled closure** — a statement cannot be closed while unmatched or partially matched transactions remain.
7. **Auditability** — imports, matches, exclusions and statement closure are audit logged.

## Tenant isolation

Every operation is scoped by the authenticated organization and school. Payment candidates are constrained through the student's school ownership rather than trusting a client-provided organization identifier.

## Extension boundary

The import endpoint accepts normalized transactions. Open-banking, bank API, CSV, OFX or provider-specific adapters can feed this boundary later without coupling the reconciliation engine to one bank.
