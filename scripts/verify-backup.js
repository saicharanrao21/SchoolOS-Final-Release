/**
 * ============================================================
 * SCHOOLOS — BACKUP RESTORE VERIFICATION SCRIPT
 * ============================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://schoolos_user:schoolos_password@localhost:5432/schoolos_test_restore';

function verifyBackup(backupFilePath) {
  if (!backupFilePath || !fs.existsSync(backupFilePath)) {
    console.error('[RESTORE VERIFY ERROR] Specified backup file does not exist:', backupFilePath);
    process.exit(1);
  }

  console.log(`[RESTORE VERIFY] Restoring ${backupFilePath} into isolated test DB...`);

  try {
    // 1. Recreate test restore DB
    execSync(`psql "postgresql://schoolos_user:schoolos_password@localhost:5432/postgres" -c "DROP DATABASE IF EXISTS schoolos_test_restore;"`);
    execSync(`psql "postgresql://schoolos_user:schoolos_password@localhost:5432/postgres" -c "CREATE DATABASE schoolos_test_restore;"`);

    // 2. Restore backup into test DB
    execSync(`psql "${TEST_DB_URL}" -f "${backupFilePath}"`, { stdio: 'ignore' });

    // 3. Verify key tables exist
    const output = execSync(`psql "${TEST_DB_URL}" -c "\\dt"`, { encoding: 'utf8' });
    console.log('[RESTORE VERIFY] Table list verification output:\n', output);

    if (output.includes('Organization') && output.includes('User') && output.includes('Student')) {
      console.log('[RESTORE VERIFY SUCCESS] Backup restoration & schema integrity verified successfully!');
    } else {
      throw new Error('Key schema tables missing from restored database');
    }

    // 4. Safe Cleanup
    execSync(`psql "postgresql://schoolos_user:schoolos_password@localhost:5432/postgres" -c "DROP DATABASE IF EXISTS schoolos_test_restore;"`);
  } catch (error) {
    console.error('[RESTORE VERIFY ERROR] Verification failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const backupFile = process.argv[2];
  verifyBackup(backupFile);
}

module.exports = { verifyBackup };
