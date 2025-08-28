import type { TypedPool } from '../../infra/pg';
import type { User, CreateUser, UpdateUser, UserResult } from '../../entities/user';
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

export const init = (pool: TypedPool): UserRepo => ({
  create: async (user: CreateUser): Promise<User> => {
    const { query, params } = create(user);
    const result = await pool.queryOne<User>(query, params);
    return result!;
  },

  findOne: async (definition: Partial<User>, includePassword = false): Promise<UserResult> => {
    const { query, params } = selectOne(definition, includePassword);
    const result = await pool.queryOne<UserResult>(query, params);
    return result!;
  },

  findOneByUsernameOrEmail: async (value: string, includePassword = false): Promise<User | null> => {
    const { query, params } = selectByUsernameOrEmail(value, includePassword);
    return await pool.queryOne<User>(query, params);
  },

  findAll: async (): Promise<User[]> => {
    const { query, params } = selectAll();
    return await pool.queryAll<User>(query, params);
  },

  isExists: async (definition: Partial<User>): Promise<boolean> => {
    const { query, params } = selectExisting('users', definition);
    const result = await pool.queryOne(query, params);
    return !!result;
  },

  update: async (id: number, definition: Partial<UpdateUser>): Promise<User> => {
    const { query, params } = update(id, definition);
    const result = await pool.queryOne<User>(query, params);
    return result!;
  },

  updateEmail: async (id: number, email: string): Promise<User> => {
    const { query, params } = updateUserEmail(id, email);
    const result = await pool.queryOne<User>(query, params);
    return result!;
  },

  updatePassword: async (id, password) => {
    const { query, params } = updateUserPassword(id, password);
    const result = await pool.queryOne<User>(query, params);
    return result!;
  },

  remove: async (id: number): Promise<{ removed: boolean }> => {
    const { query, params } = remove(id);
    const { rowCount } = await pool.query(query, params);
    const removed = (rowCount ?? 0) > 0;
    return { removed };
  },
});
