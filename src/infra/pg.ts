import pg from 'pg';
import { PoolConfig } from 'pg';

export class TypedPool {
  private pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  async query<T = any>(query: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
    const result = await this.pool.query(query, params);
    return result as { rows: T[]; rowCount: number | null };
  }

  async queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query(query, params);
    return result.rows[0] || null;
  }

  async queryAll<T = any>(query: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}

export const init = async (config: PoolConfig) => {
  try {
    const pool = new pg.Pool(config);
    await pool.query('SELECT 1');

    return new TypedPool(pool);
  } catch (error) {
    console.log({ timestamp: Date.now(), error });
    throw new Error('Database connection failed', { cause: error });
  }
};
