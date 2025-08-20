import type { User, CreateUser, UpdateUser } from '../../entities/user.js';

export const fields = [
  'id',
  'email',
  'password',
  'username',
  'createdAt',
  'updatedAt',
];

/**
 * Create a single user
 */
export const create = (definition: CreateUser) => {
  const columns = Object.keys(definition);
  const values = Object.values(definition);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO "public"."users"
    (${columns.map((col) => `"${col}"`).join(', ')})
    VALUES (${placeholders})
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: values };
};

/**
 * Update a user by ID
 */
export const update = (id: number, definition: Partial<UpdateUser>) => {
  const updateData = { ...definition, updatedAt: new Date() };
  const columns = Object.keys(updateData);
  const values = Object.values(updateData);

  const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');

  const query = `
    UPDATE "public"."users"
    SET ${setClause}
    WHERE "id" = $${values.length + 1}
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: [...values, id] };
};

/**
 * Update user's email
 */
export const updateUserEmail = (id: number, email: string) => {
  const query = `
    UPDATE "public"."users"
    SET "email" = $1, "updatedAt" = $3
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: [email, id, new Date()] };
};

/**
 *
 * @param {number} id
 * @param {string} password
 * @returns {RowSqlResult}
 */
export const updateUserPassword = (id: number, password: string) => {
  const query = `
    UPDATE "public"."user"
    SET "password" = $1, "updatedAt" = $3
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  const params = [password, id, Date.now()];

  return { query, params };
};

/**
 * Find user by criteria
 */
export const selectOne = (
  definition: Partial<User>,
  includePassword = false,
) => {
  const selectFields = includePassword ? [...fields, 'password'] : fields;
  const columns = Object.keys(definition);
  const values = Object.values(definition);

  const select = `
    SELECT ${selectFields.map((f) => `"${f}"`).join(', ')}
    FROM "public"."users" u
  `;

  const where =
    columns.length > 0
      ? 'WHERE ' +
        columns.map((col, i) => `u."${col}" = $${i + 1}`).join(' AND ')
      : '';

  const query = select + where + ';';

  return { query, params: values };
};

/**
 * Find user by username or email
 */
export const selectByUsernameOrEmail = (
  value: string,
  includePassword = false,
) => {
  const selectFields = includePassword ? [...fields, 'password'] : fields;

  const query = `
    SELECT ${selectFields.map((f) => `"${f}"`).join(', ')}
    FROM "public"."users"
    WHERE LOWER("email") = LOWER($1) OR "username" = $1;
  `;

  return { query, params: [value] };
};

/**
 * Find users by IDs
 */
export const selectByIds = (userIds: number[]) => {
  if (userIds.length === 0) {
    return { query: 'SELECT * FROM users WHERE false;', params: [] };
  }

  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    SELECT ${fields.map((f) => `"${f}"`).join(', ')}
    FROM "public"."users"
    WHERE "id" IN (${placeholders});
  `;

  return { query, params: userIds };
};

/**
 * Delete user by ID
 */
export const remove = (id: number) => {
  const query = `
    DELETE FROM "public"."users"
    WHERE "id" = $1;
  `;

  return { query, params: [id] };
};

/**
 * Check if user exists
 */
export const selectExisting = (table: string, definition: Partial<User>) => {
  const columns = Object.keys(definition);
  const values = Object.values(definition);

  const where =
    columns.length > 0
      ? 'WHERE ' + columns.map((col, i) => `"${col}" = $${i + 1}`).join(' AND ')
      : '';

  const query = `
    SELECT 1
    FROM "public"."${table}"
    ${where}
    LIMIT 1;
  `;

  return { query, params: values };
};
