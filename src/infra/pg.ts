import pg from 'pg';
import { PoolConfig } from 'pg';

export const init = async (config: PoolConfig) => {
  try {
    const pool = new pg.Pool(config);
    await pool.query('SELECT 1');

    return pool;
  } catch (error) {
    console.log({ timestamp: Date.now(), error });
    throw new Error('Database connection failed', { cause: error });
  }
};
