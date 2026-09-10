# SCHOOLOS — PRODUCTION DEPLOYMENT & ROLLBACK RUNBOOK

---

## 1. Overview
This runbook defines the production deployment and rollback procedure for SchoolOS API, Next.js Web Management UI, and database migrations.

---

## 2. Pre-Deployment Checklist
- [ ] Verify GitHub Actions CI build, API tests, Web build, and Flutter tests are green on `main`.
- [ ] Confirm database backup is taken via `node scripts/backup-db.js`.
- [ ] Verify backup restoration integrity via `node scripts/verify-backup.js <backup_file>`.
- [ ] Review pending Prisma database migrations (`npx prisma migrate status`).
- [ ] Confirm production environment variables in `.env` match `.env.example` requirements.

---

## 3. Production Deployment Procedure
1. **Pull Latest Code & Build Containers:**
   ```bash
   git pull origin main
   docker-compose build --no-cache
   ```

2. **Execute Prisma Database Migrations:**
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```

3. **Deploy Containerized Application:**
   ```bash
   docker-compose up -d --remove-orphans
   ```

4. **Post-Deployment Verification:**
   ```bash
   curl -f http://localhost:3000/api/v1/health
   curl -f http://localhost:3000/api/v1/health/ready
   ```

---

## 4. Rollback Procedure
If readiness checks fail (`GET /health/ready` returns 503) or severe errors occur post-deployment:

1. **Revert Application Containers:**
   ```bash
   docker-compose down
   git checkout HEAD~1
   docker-compose up -d
   ```

2. **Restore Database (If Schema Migration Caused Corruption):**
   ```bash
   node scripts/verify-backup.js ./backups/latest_backup.sql
   ```
