# Communication Gateway Hub

The SchoolOS communications layer now has a school-scoped gateway control surface for SMS, WhatsApp, email and push providers.

## Provider catalogue

The catalogue contains 32 provider profiles and declares supported channels plus required configuration fields. This is a configuration/adapter registry; a catalogue entry does not claim that a third-party credential or account has been provisioned.

## Credential protection

Gateway configuration is encrypted server-side with AES-256-GCM using `NOTIFICATION_CONFIG_ENCRYPTION_KEY`. API list/detail responses never return decrypted credentials. Production must inject a high-entropy secret through the environment/secret manager.

## Tenant isolation

Every gateway operation is scoped by authenticated organization and school. Campaign creation and execution also validate organization ownership so a school identifier supplied by a client cannot cross tenant boundaries.

## API surface

- `GET /api/v1/notifications/gateways/catalog`
- `GET /api/v1/notifications/gateways?schoolId=...`
- `GET /api/v1/notifications/gateways/:id?schoolId=...`
- `POST /api/v1/notifications/gateways`
- `PATCH /api/v1/notifications/gateways/:id`
- `POST /api/v1/notifications/gateways/:id/default`
- `DELETE /api/v1/notifications/gateways/:id?schoolId=...`

All mutating endpoints require `notifications.gateway.manage`; read/catalog endpoints require `notifications.gateway.read`.
