/**
 * ============================================================
 * SCHOOLOS — PRODUCTION DATABASE BACKUP SCRIPT
 * ============================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || '7', 10);
const DB_URL = process.env.DATABASE_URL || 'postgresql://schoolos_user:schoolos_password@localhost:5432/schoolos_db';

function runBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `schoolos_backup_${timestamp}.sql`);

  console.log(`[BACKUP] Starting database backup to ${backupPath}...`);

  try {
    // Execute pg_dump
    execSync(`pg_dump "${DB_URL}" -F p -f "${backupPath}"`, { stdio: 'inherit' });
    console.log(`[BACKUP] Database backup completed successfully: ${backupPath}`);

    // Retention Cleanup: Keep latest N backups
    cleanOldBackups();
  } catch (error) {
    console.error('[BACKUP ERROR] Database backup failed:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('schoolos_backup_') && f.endsWith('.sql'))
    .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (files.length > MAX_BACKUPS) {
    const toRemove = files.slice(MAX_BACKUPS);
    for (const file of toRemove) {
      console.log(`[BACKUP RETENTION] Removing old backup: ${file.name}`);
      fs.unlinkSync(file.path);
    }
  }
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup };
