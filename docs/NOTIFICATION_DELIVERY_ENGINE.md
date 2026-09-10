# Notification Delivery & Routing Engine

## Implemented

- Tenant/school validation before processing domain notification events.
- Recipient lookup is organization/school scoped.
- User notification preferences support exact event names and `domain.*` wildcards.
- Default channels remain in-app and push, while explicit preferences can opt users into email/SMS/WhatsApp.
- External channels are selected only when an active school default gateway exists.
- Notification records are created as `QUEUED` and dispatched through the central orchestrator.
- Successful deliveries are marked `SENT`; transient failures move to `RETRYING` for up to three attempts; exhausted failures become `FAILED`.
- Campaign recipients now reflect actual delivery outcomes instead of being marked sent before dispatch.
- Gateway credentials are decrypted only inside the delivery process and are passed to provider adapters without exposing them to API responses.
- Template creation/update is tenant scoped to prevent cross-organization template access.

## External provider note

The provider classes remain adapter boundaries. Third-party credentials/API calls must be implemented and verified against each provider's current API contract before enabling live production traffic.
