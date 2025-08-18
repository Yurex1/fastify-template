import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { config } from '../src/config';

const action = process.argv[2];

const queryBuilder = {
  up: async () => {
    const buffer = await readFile('db/v1.sql');
    return buffer.toString();
  },

  down: async () => {
    return `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `;
  },

  seed: async () => {
    throw new Error('Not implemented.');
    // const buffer = await readFile('db/seed.sql');
    // return buffer.toString();
  },
}[action];

const pool = new pg.Pool(config.pg);

try {
  if (!queryBuilder) throw Error(`Invalid action: ${action}`);
  const query = await queryBuilder();
  await pool.query(query);
  console.log('Migration ran successfully.');
} catch (e) {
  console.log('Migration failed:', e);
} finally {
  await pool.end();
}
