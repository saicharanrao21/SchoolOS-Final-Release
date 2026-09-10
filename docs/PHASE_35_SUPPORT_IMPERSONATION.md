# Phase 35 — Secure School Support & Impersonation

## Delivered

- Time-bound superadmin support sessions scoped to one organization and one active user.
- Cryptographically random support tokens with SHA-256 hashing at rest.
- Strict target-user tenant validation and active-user validation.
- Support-token exchange into a normal JWT carrying explicit impersonation metadata.
- JWT-level revocation: every impersonated request re-checks the backing support session.
- Session expiry and explicit revocation/end support.
- Actor, target, reason and lifecycle events written to the existing audit system.
- Superadmin web control-plane screen for creating and revoking sessions.
- Active-session visibility for the initiating support operator.
- Seeded `platform.support.impersonate` permission.

## Security contract

1. Only users with `platform.support.impersonate` can create, list or end sessions.
2. The target user must belong to the selected organization and be active.
3. The raw support token is never persisted; only its SHA-256 digest is stored.
4. Exchange fails when the session is inactive, ended or expired.
5. The resulting JWT preserves the target user's roles/permissions but adds:
   - `impersonation: true`
   - `impersonationSessionId`
   - `impersonatorUserId`
6. JwtStrategy revalidates the session on every impersonated API request, so ending a support session immediately blocks further use of the issued token.
7. Support access is always auditable.

## External dependency

Production must provide a high-entropy `JWT_SECRET` through the environment/secret manager.
