import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/propo/AppData/Roaming/com.kairo.os/kairo.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in DB:', tables);

try {
  const cols = db.prepare('PRAGMA table_info(games)').all();
  console.log('Columns in games:', cols.map(c => c.name));
} catch (e) {
  console.error('Error reading games table info:', e.message);
}

db.close();
