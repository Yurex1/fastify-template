const fields = ['id', 'email', 'password', 'username', 'createdAt', 'updatedAt'];

export const updateUserEmail = (id: number, email: string) => {
  const query = `
    UPDATE "public"."users"
    SET "email" = $1, "updatedAt" = $3
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: [email, id, new Date()] };
};

export const updateUserPassword = (id: number, password: string) => {
  const query = `
    UPDATE "public"."users"
    SET "password" = $1, "updatedAt" = $3
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  const params = [password, id, new Date()];

  return { query, params };
};

export const selectByUsernameOrEmail = (value: string, includePassword = false) => {
  const selectFields = includePassword ? [...fields, 'password'] : fields;

  const query = `
    SELECT ${selectFields.map((f) => `"${f}"`).join(', ')}
    FROM "public"."users"
    WHERE LOWER("email") = LOWER($1) OR "username" = $1;
  `;

  return { query, params: [value] };
};
