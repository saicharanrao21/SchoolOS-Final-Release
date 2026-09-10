# SCHOOLOS — OPERATIONAL MONITORING & INCIDENT RESPONSE RUNBOOK

---

## 1. Operational Endpoints & Health Probes
- **Liveness Probe:** `GET /api/v1/health/live` (Kubernetes / Docker container status check).
- **Readiness Probe:** `GET /api/v1/health/ready` (Validates database connectivity; returns 200 OK or 503 Service Unavailable).
- **Overall System Health:** `GET /api/v1/health` (Reports database connection status, outbox pending/failed queue counts, uptime).
- **Application Metrics:** `GET /api/v1/health/metrics` (Reports memory usage MB, outbox queue depth, process uptime).

---

## 2. Alert Thresholds & Action Triggers
| Alert Metric | Threshold | Severity | Immediate Action |
| :--- | :--- | :--- | :--- |
| **API Readiness Failure** | `HTTP 503` > 1 min | **CRITICAL** | Inspect PostgreSQL database logs; check connection pool. |
| **Outbox Backlog** | `pending > 500` | **HIGH** | Check background outbox worker process health. |
| **Outbox Failure Count** | `failed > 10` | **HIGH** | Inspect `lastError` in `OutboxEvent` table. |
| **Memory Usage (RSS)** | `> 1.5 GB` | **MEDIUM** | Restart API container to release memory leak. |

---

## 3. Structured Log Context & Request Correlation
All API requests generate structured JSON log entries featuring `requestId` (`x-request-id` header):
```json
{
  "requestId": "req-1725444000-a1b2c",
  "method": "POST",
  "url": "/api/v1/sync/push",
  "statusCode": 200,
  "durationMs": 14,
  "userId": "usr-123",
  "organizationId": "org-456"
}
```
In incident investigations, search production logs by `requestId` to trace error execution flows.
