import type { TypedPool } from '../infra/pg';
import type { RowSqlResult, RowSqlParam } from '../utils/rowSql/types';

export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  lastseen: Date;
}

export type CreateEntity<T> = Omit<T, keyof BaseEntity>;

export type UpdateEntity<T> = Partial<CreateEntity<T>>;

export class SqlBuilder {
  static buildCreateQuery<T extends BaseEntity>(
    tableName: string,
    fields: (keyof T)[],
    data: CreateEntity<T>,
  ): RowSqlResult {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO "public"."${tableName}"
      (${columns.map((col) => `"${col}"`).join(', ')})
      VALUES (${placeholders})
      RETURNING ${fields.map((f) => `"${String(f)}"`).join(', ')};
    `;

    return { query, params: values as RowSqlParam[] };
  }

  static buildUpdateQuery<T extends BaseEntity>(
    tableName: string,
    fields: (keyof T)[],
    id: number,
    data: UpdateEntity<T>,
  ): RowSqlResult {
    const updateData = { ...data, updatedAt: new Date() };
    const columns = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');

    const query = `
      UPDATE "public"."${tableName}"
      SET ${setClause}
      WHERE "id" = $${values.length + 1}
      RETURNING ${fields.map((f) => `"${String(f)}"`).join(', ')};
    `;

    return { query, params: [...values, id] };
  }

  static buildSelectOneQuery<T extends BaseEntity>(
    tableName: string,
    fields: (keyof T)[],
    definition: Partial<T>,
  ): RowSqlResult {
    const columns = Object.keys(definition);
    const values = Object.values(definition);

    const select = `
      SELECT ${fields.map((f) => `"${String(f)}"`).join(', ')}
      FROM "public"."${tableName}"
    `;

    const where = columns.length > 0 ? 'WHERE ' + columns.map((col, i) => `"${col}" = $${i + 1}`).join(' AND ') : '';

    const query = select + where + ';';

    return { query, params: values };
  }

  static buildSelectAllQuery<T extends BaseEntity>(tableName: string, fields: (keyof T)[]): RowSqlResult {
    const query = `
      SELECT ${fields.map((f) => `"${String(f)}"`).join(', ')}
      FROM "public"."${tableName}";
    `;

    return { query, params: [] };
  }

  static buildDeleteQuery(tableName: string, id: number): RowSqlResult {
    const query = `
      DELETE FROM "public"."${tableName}"
      WHERE "id" = $1;
    `;

    return { query, params: [id] };
  }

  static buildExistsQuery<T extends BaseEntity>(tableName: string, definition: Partial<T>): RowSqlResult {
    const columns = Object.keys(definition);
    const values = Object.values(definition);

    const where = columns.length > 0 ? 'WHERE ' + columns.map((col, i) => `"${col}" = $${i + 1}`).join(' AND ') : '';

    const query = `
      SELECT 1
      FROM "public"."${tableName}"
      ${where}
      LIMIT 1;
    `;

    return { query, params: values };
  }
}

export abstract class EntityRepo<T extends BaseEntity> {
  protected pool: TypedPool;
  protected tableName: string;
  protected fields: (keyof T)[];

  constructor(pool: TypedPool, tableName: string, fields: (keyof T)[]) {
    this.pool = pool;
    this.tableName = tableName;
    this.fields = fields;
  }

  async create(data: CreateEntity<T>): Promise<T> {
    const { query, params } = SqlBuilder.buildCreateQuery(this.tableName, this.fields, data);
    const result = await this.pool.queryOne<T>(query, params);
    return result!;
  }

  async findOne(definition: Partial<T>): Promise<T | null> {
    const { query, params } = SqlBuilder.buildSelectOneQuery(this.tableName, this.fields, definition);
    return await this.pool.queryOne<T>(query, params);
  }

  async findById(id: number): Promise<T | null> {
    return this.findOne({ id } as Partial<T>);
  }

  async findAll(): Promise<T[]> {
    const { query, params } = SqlBuilder.buildSelectAllQuery(this.tableName, this.fields);
    return await this.pool.queryAll<T>(query, params);
  }

  async update(id: number, data: UpdateEntity<T>): Promise<T> {
    const { query, params } = SqlBuilder.buildUpdateQuery(this.tableName, this.fields, id, data);
    const result = await this.pool.queryOne<T>(query, params);
    return result!;
  }

  async remove(id: number): Promise<{ removed: boolean }> {
    const { query, params } = SqlBuilder.buildDeleteQuery(this.tableName, id);
    const { rowCount } = await this.pool.query(query, params);
    const removed = (rowCount ?? 0) > 0;
    return { removed };
  }

  async exists(definition: Partial<T>): Promise<boolean> {
    const { query, params } = SqlBuilder.buildExistsQuery(this.tableName, definition);
    const result = await this.pool.queryOne(query, params);
    return !!result;
  }

  async existsById(id: number): Promise<boolean> {
    return this.exists({ id } as Partial<T>);
  }
}
