# SCHOOLOS — DATABASE BACKUP & DISASTER RECOVERY (DR) RUNBOOK

---

## 1. RPO & RTO Targets
- **Recovery Point Objective (RPO):** < 1 hour (Data loss limit in catastrophic regional failure).
- **Recovery Time Objective (RTO):** < 30 minutes (Downtime limit to restore core services).

---

## 2. Database Backup Strategy
- **Frequency:** Automated daily full backups + WAL (Write-Ahead Logging) archiving for point-in-time recovery.
- **Execution Script:**
  ```bash
  node scripts/backup-db.js
  ```
- **Backup Storage Path:** `./backups` (or AWS S3 bucket when configured).
- **Retention Policy:**
  - Daily Backups: Retain 7 days.
  - Weekly Backups: Retain 4 weeks.
  - Monthly Backups: Retain 12 months.

---

## 3. Backup Restoration & Verification Procedure
Backup integrity must be verified periodically against an isolated test database (`schoolos_test_restore`):

```bash
node scripts/verify-backup.js ./backups/schoolos_backup_2026-09-04T10-00-00.sql
```

---

## 4. Disaster Recovery Scenarios
### Scenario A: Primary Database Node Failure
1. Promote read-replica to primary writer node.
2. Update `DATABASE_URL` connection string in `.env`.
3. Restart API service (`docker-compose restart api`).
4. Verify readiness (`curl http://localhost:3000/api/v1/health/ready`).

### Scenario B: Complete Regional Cloud Outage
1. Re-provision PostgreSQL database in secondary cloud region.
2. Execute backup restoration from latest S3/offsite backup file.
3. Update DNS CNAME records to secondary API gateway.
