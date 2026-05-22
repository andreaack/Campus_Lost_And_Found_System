const { exec } = require('child_process');
const path  = require('path');
const fs    = require('fs');
require('dotenv').config();

const timestamp = new Date().toISOString().split('T')[0];   
const backupDir = path.join(__dirname, '../backups', timestamp);
const uri       = process.env.MONGODB_URI;


exec(`mongodump --uri="${uri}" --out="${backupDir}"`, (err) => {
  if (err) { console.error('Backup failed:', err.message); process.exit(1); }
  console.log(`Backup complete: ${backupDir}`);
  pruneOldBackups();
});

function pruneOldBackups() {
  const backupsRoot  = path.join(__dirname, '../backups');
  const cutoff       = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dirs         = fs.readdirSync(backupsRoot);
  dirs.forEach(dir => {
    const dirPath = path.join(backupsRoot, dir);
    const stat    = fs.statSync(dirPath);
    if (stat.isDirectory() && stat.mtimeMs < cutoff) {
      fs.rmSync(dirPath, { recursive: true });
      console.log(`Deleted old backup: ${dir}`);
    }
  });
}
