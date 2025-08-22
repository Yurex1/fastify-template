import type { Pool } from 'pg';
import type {
  User,
  CreateUser,
  UpdateUser,
  UserResult,
} from '../../entities/user';
import type { UserRepo } from './types';
import {
  create,
  update,
  updateUserEmail,
  selectOne,
  selectByUsernameOrEmail,
  remove,
  selectExisting,
  updateUserPassword,
  selectAll,
} from './sql';

export const init = (pool: Pool): UserRepo => ({
  create: async (user: CreateUser): Promise<User> => {
    const { query, params } = create(user);
    const result = await pool.query(query, params);
    return result.rows[0] as User;
  },

  findOne: async (
    definition: Partial<User>,
    includePassword = false,
  ): Promise<UserResult> => {
    const { query, params } = selectOne(definition, includePassword);
    const result = await pool.query(query, params);
    return result.rows[0] as UserResult;
  },

  findOneByUsernameOrEmail: async (
    value: string,
    includePassword = false,
  ): Promise<User | null> => {
    const { query, params } = selectByUsernameOrEmail(value, includePassword);
    const result = await pool.query(query, params);
    return result.rows[0] as User | null;
  },

  findAll: async (): Promise<User[]> => {
    const { query, params } = selectAll();
    const result = await pool.query(query, params);
    return result.rows as User[];
  },

  isExists: async (definition: Partial<User>): Promise<boolean> => {
    const { query, params } = selectExisting('users', definition);
    const result = await pool.query(query, params);
    return !!result.rows[0];
  },

  update: async (
    id: number,
    definition: Partial<UpdateUser>,
  ): Promise<User> => {
    const { query, params } = update(id, definition);
    const result = await pool.query(query, params);
    return result.rows[0] as User;
  },

  updateEmail: async (id: number, email: string): Promise<User> => {
    const { query, params } = updateUserEmail(id, email);
    const result = await pool.query(query, params);
    return result.rows[0] as User;
  },

  updatePassword: async (id, password) => {
    const { query, params } = updateUserPassword(id, password);
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  remove: async (id: number): Promise<{ removed: boolean }> => {
    const { query, params } = remove(id);
    const { rowCount } = await pool.query(query, params);
    const removed = (rowCount ?? 0) > 0;
    return { removed };
  },
});
