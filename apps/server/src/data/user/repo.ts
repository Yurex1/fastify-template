import type { TypedPool } from '../../infra/pg';
import type { User, CreateUser, UpdateUser, UserResult } from '../../entities/user';
import type { UserRepo } from './types';
import { EntityRepo } from '../EntityRepo';
import { updateUserEmail, selectByUsernameOrEmail, updateLastSeenDate, updateUserPassword } from './sql';

class UserRepository extends EntityRepo<User> {
  constructor(pool: TypedPool) {
    super(pool, 'users', ['id', 'email', 'username', 'password', 'createdAt', 'updatedAt', 'lastseen']);
  }

  async findOne(definition: Partial<User>, includePassword = false): Promise<UserResult> {
    if (includePassword) {
      const { query, params } = this.buildSelectOneWithPasswordQuery(definition);
      const result = await this.pool.queryOne<UserResult>(query, params);
      return result!;
    }

    const result = await super.findOne(definition);
    return result as UserResult;
  }

  async findOneByUsernameOrEmail(value: string, includePassword = false): Promise<User | null> {
    const { query, params } = selectByUsernameOrEmail(value, includePassword);
    return await this.pool.queryOne<User>(query, params);
  }

  async updateEmail(id: number, email: string): Promise<User> {
    const { query, params } = updateUserEmail(id, email);
    const result = await this.pool.queryOne<User>(query, params);
    return result!;
  }

  async updateLastSeen(id: number) {
    const { query, params } = updateLastSeenDate(id);
    const result = await this.pool.queryOne<User>(query, params);
    return result!;
  }

  async updatePassword(id: number, password: string): Promise<User> {
    const { query, params } = updateUserPassword(id, password);
    const result = await this.pool.queryOne<User>(query, params);
    return result!;
  }

  private buildSelectOneWithPasswordQuery(definition: Partial<User>) {
    const columns = Object.keys(definition);
    const values = Object.values(definition);

    const select = `
      SELECT ${this.fields.map((f) => `"${f}"`).join(', ')}, "password"
      FROM "public"."${this.tableName}"
    `;

    const where = columns.length > 0 ? 'WHERE ' + columns.map((col, i) => `"${col}" = $${i + 1}`).join(' AND ') : '';

    const query = select + where + ';';

    return { query, params: values };
  }
}

export const init = (pool: TypedPool): UserRepo => {
  const userRepo = new UserRepository(pool);

  return {
    create: (user: CreateUser) => userRepo.create(user),
    findOne: (definition: Partial<User>, includePassword = false) => userRepo.findOne(definition, includePassword),
    findById: (id: number) => userRepo.findById(id),
    findAll: () => userRepo.findAll(),
    update: (id: number, definition: Partial<UpdateUser>) => userRepo.update(id, definition),
    remove: (id: number) => userRepo.remove(id),
    exists: (definition: Partial<User>) => userRepo.exists(definition),
    existsById: (id: number) => userRepo.existsById(id),
    findOneByUsernameOrEmail: (value: string, includePassword = false) =>
      userRepo.findOneByUsernameOrEmail(value, includePassword),
    updateEmail: (id: number, email: string) => userRepo.updateEmail(id, email),
    updatePassword: (id: number, password: string) => userRepo.updatePassword(id, password),
    updateLastSeen: (id: number) => userRepo.updateLastSeen(id),
  };
};
