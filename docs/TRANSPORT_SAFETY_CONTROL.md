# Transport Safety Control

The transport tracking layer now treats GPS telemetry as a safety signal, not only as a map feed.

## Automatic detection

- **Route deviation:** each location is checked against active route stops using a Haversine distance calculation. The school's `TransportPolicy.routeDeviationThresholdMeters` is used as the threshold.
- **Overspeeding:** telemetry above the current school-bus safety threshold of 80 km/h creates an incident. A higher threshold (100 km/h) is classified as high severity.
- **Deduplication:** an open incident of the same type for the same trip is not repeatedly created on every GPS packet.

## Security

Every tracking read/write and incident operation is scoped through the authenticated organization. Trip lookups traverse `TransportTrip -> TransportRoute -> School -> Organization`; client-supplied school ownership is never trusted.

## Operations

The web command center exposes **Transport → Safety & Incidents** for open incident review and resolution. Incidents are audit logged and emit `transport.safety.incident` for the notification/realtime pipeline.
