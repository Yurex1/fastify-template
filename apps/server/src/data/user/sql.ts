const fields = ['id', 'email', 'password', 'username', 'createdAt', 'updatedAt', 'lastseen'];

export const updateUserEmail = (id: number, email: string) => {
  const query = `
    UPDATE "public"."users"
    SET "email" = $1, "updatedAt" = now()
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: [email, id] };
};

export const updateLastSeenDate = (id: number) => {
  const query = `
    UPDATE "public"."users"
    SET "lastseen" = now()
    WHERE "id" = $1
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  return { query, params: [id] };
};

export const updateUserPassword = (id: number, password: string) => {
  const query = `
    UPDATE "public"."users"
    SET "password" = $1, "updatedAt" = now()
    WHERE "id" = $2
    RETURNING ${fields.map((f) => `"${f}"`).join(', ')};
  `;

  const params = [password, id];

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
