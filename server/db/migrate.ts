import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

type Action = 'up' | 'down' | 'status' | 'create' | 'redo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const TABLE = '_migrations';
const LOCK_KEY = 748392;

function sha256(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

async function ensureDir() {
  await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
}

async function readMigrationFile(fp: string) {
  const raw = await fs.readFile(fp, 'utf8');
  const norm = raw.replace(/\r\n/g, '\n');
  const upSplit = norm.split(/^--\s*up\s*$/m);
  const body = upSplit.length === 1 ? norm : upSplit.pop()!;
  const [up, down = ''] = body.split(/^--\s*down\s*$/m);
  if (!up?.trim() || !down?.trim()) throw new Error(`Bad migration format: ${path.basename(fp)}`);
  return { up: up.trim(), down: down.trim(), checksum: sha256(up.trim()) };
}

async function loadAllMigrations() {
  await ensureDir();
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  return files.map((f) => ({ name: f, path: path.join(MIGRATIONS_DIR, f) }));
}

async function withLock<T>(pool: Pool, fn: () => Promise<T>) {
  const c = await pool.connect();

  try {
    await c.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

    return await fn();
  } finally {
    await c.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
    c.release();
  }
}

async function ensureTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getApplied(pool: Pool) {
  const { rows } = await pool.query<{ name: string; checksum: string }>(
    `SELECT name, checksum FROM ${TABLE} ORDER BY name ASC`,
  );
  return new Map(rows.map((r) => [r.name, r.checksum]));
}

async function up(pool: Pool) {
  return withLock(pool, async () => {
    await ensureTable(pool);
    const applied = await getApplied(pool);
    const all = await loadAllMigrations();
    const pending = all.filter((m) => !applied.has(m.name));
    if (!pending.length) {
      console.log('Nothing to apply.');
      return;
    }

    for (const m of pending) {
      const { up, checksum } = await readMigrationFile(m.path);
      await pool.query('BEGIN');
      try {
        await pool.query(up);
        await pool.query(`INSERT INTO ${TABLE}(name, checksum) VALUES ($1,$2)`, [m.name, checksum]);
        await pool.query('COMMIT');
        console.log(`Applied ${m.name}`);
      } catch (e) {
        await pool.query('ROLLBACK');
        throw e;
      }
    }
  });
}

async function down(pool: Pool, countArg?: string) {
  const n = countArg ? Math.max(1, parseInt(countArg, 10)) : 1;
  return withLock(pool, async () => {
    await ensureTable(pool);
    const { rows } = await pool.query(`SELECT name FROM ${TABLE} ORDER BY name DESC LIMIT $1`, [n]);
    if (!rows.length) {
      console.log('Nothing to rollback.');
      return;
    }
    for (const r of rows) {
      const name = r.name as string;
      const mPath = path.join(MIGRATIONS_DIR, name);
      const exists = await fs
        .access(mPath)
        .then(() => true)
        .catch(() => false);
      if (!exists) throw new Error(`Missing file for applied migration: ${name}`);
      const { down } = await readMigrationFile(mPath);
      await pool.query('BEGIN');
      try {
        await pool.query(down);
        await pool.query(`DELETE FROM ${TABLE} WHERE name=$1`, [name]);
        await pool.query('COMMIT');
        console.log(`Rolled back ${name}`);
      } catch (e) {
        await pool.query('ROLLBACK');
        throw e;
      }
    }
  });
}

async function status(pool: Pool) {
  await ensureTable(pool);
  const applied = await getApplied(pool);
  const all = await loadAllMigrations();
  const lines: string[] = [];
  for (const m of all) {
    const isApplied = applied.has(m.name);
    const mark = isApplied ? 'APPLIED' : 'PENDING';
    lines.push(`${mark}  ${m.name}`);
  }
  if (!all.length) console.log('No migrations found.');
  else console.log(lines.join('\n'));
  const drift: string[] = [];
  for (const m of all) {
    if (!applied.has(m.name)) continue;
    const { checksum } = await readMigrationFile(m.path);
    const saved = applied.get(m.name)!;
    if (checksum !== saved) drift.push(m.name);
  }
  if (drift.length) {
    console.log('\nWARNING: checksum drift detected:');
    drift.forEach((n) => console.log(`DRIFT  ${n}`));
  }
}

function tsNowStamp() {
  const d = new Date();
  const pad = (x: number, n = 2) => x.toString().padStart(n, '0');
  const s = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return s;
}

async function create(name?: string) {
  if (!name) throw new Error('Usage: create <name>');
  await ensureDir();
  const fname = `${tsNowStamp()}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
  const fp = path.join(MIGRATIONS_DIR, fname);
  const tpl = `-- up

-- down
`;
  await fs.writeFile(fp, tpl, 'utf8');
  console.log(`Created ${path.relative(process.cwd(), fp)}`);
}

async function redoCmd(pool: Pool) {
  const { rows } = await pool.query(`SELECT name FROM ${TABLE} ORDER BY name DESC LIMIT 1`);
  if (!rows.length) {
    console.log('Nothing to redo.');
    return;
  }
  await down(pool, '1');
  await up(pool);
}

async function main() {
  const action = (process.argv[2] || '') as Action;
  const arg = process.argv[3];

  const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  try {
    if (action === 'up') await up(pool);
    else if (action === 'down') await down(pool, arg);
    else if (action === 'status') await status(pool);
    else if (action === 'create') await create(arg);
    else if (action === 'redo') await redoCmd(pool);
    else throw new Error('Usage: up | down [n] | status | create <name> | redo');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
