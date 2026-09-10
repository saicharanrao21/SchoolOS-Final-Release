# Student Health & Wellness

SchoolOS now includes a dedicated student health domain for school health-office operations.

## Scope
- Per-student medical profile with allergies, chronic conditions, emergency instructions, doctor and insurance information, and treatment consent.
- Medical visit register for routine, first-aid, illness, injury, follow-up and emergency encounters.
- Medication administration records with dosage, route, frequency, dates and lifecycle status.
- Guardian-notification tracking for medical encounters.
- School dashboard counters for profiles, daily visits, active medications and emergencies.

## Security
All endpoints require JWT authentication plus `health.read` or `health.manage`. Student records are resolved through the authenticated organization and requested school, preventing cross-tenant/cross-school access. Mutations are audit logged without recording sensitive medical payloads in audit metadata.

## API
- `GET /health/students/dashboard?schoolId=...`
- `GET /health/students/:studentId/profile?schoolId=...`
- `POST /health/students/:studentId/profile?schoolId=...`
- `GET /health/students/:studentId/visits?schoolId=...`
- `POST /health/students/:studentId/visits?schoolId=...`
- `GET /health/students/:studentId/medications?schoolId=...&activeOnly=true`
- `POST /health/students/:studentId/medications?schoolId=...`
- `PATCH /health/students/medications/:id?schoolId=...`
