# Database Migration Guide

This project uses `node-pg-migrate` for database migrations. Here's how to use it properly:

## Prerequisites

1. Make sure you have a PostgreSQL database running
2. Set up your environment variables for database connection:

   Create a `.env` file in your project root with:
   ```bash
   DATABASE_URL=postgresql://name@localhost:5432/fastify-template-db
   ```

   Or if you prefer individual variables:
   ```bash
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=name
   PG_DATABASE=fastify-template-db
   ```

## Available Commands

### Basic Migration Commands

```bash
# Run all pending migrations
pnpm migrate:up

# Rollback the last migration
pnpm migrate:down

# Create a new migration file
pnpm migrate:create <migration_name>

# Redo the last migration (down then up)
pnpm migrate:redo
```

### Advanced Commands

```bash
# Run migrations up to a specific migration
pnpm migrate up --to <migration_name>

# Rollback to a specific migration
pnpm migrate down --to <migration_name>

# Run migrations in dry-run mode (shows what would be executed)
pnpm migrate up --dry-run

# Show migration help
pnpm migrate
```

## Creating New Migrations

1. **Create a new migration file:**
   ```bash
   pnpm migrate:create add_user_profiles
   ```

2. **This will create a file like:** `db/migrations/002_add_user_profiles.ts`

3. **Edit the migration file:**
   ```typescript
   import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

   export const shorthands: ColumnDefinitions | undefined = undefined;

   export async function up(pgm: MigrationBuilder): Promise<void> {
     // Your migration logic here
     pgm.addColumn('users', {
       profile_picture: { type: 'varchar(255)' },
       bio: { type: 'text' },
     });
   }

   export async function down(pgm: MigrationBuilder): Promise<void> {
     // Rollback logic here
     pgm.dropColumn('users', 'profile_picture');
     pgm.dropColumn('users', 'bio');
   }
   ```

## Migration File Structure

Each migration file should export:

- `up(pgm: MigrationBuilder): Promise<void>` - Code to run when applying the migration
- `down(pgm: MigrationBuilder): Promise<void>` - Code to run when rolling back the migration
- `shorthands?: ColumnDefinitions` - Optional column type shortcuts

## Common Migration Operations

### Creating Tables
```typescript
pgm.createTable('table_name', {
  id: { type: 'serial', primaryKey: true },
  name: { type: 'varchar(100)', notNull: true },
  created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
});
```

### Adding Columns
```typescript
pgm.addColumn('table_name', {
  new_column: { type: 'varchar(255)' },
});
```

### Creating Indexes
```typescript
pgm.createIndex('table_name', 'index_name', ['column1', 'column2']);
```

### Creating Functions
```typescript
pgm.createFunction(
  'function_name',
  ['param1 integer', 'param2 text'],
  {
    replace: true,
    language: 'plpgsql',
  },
  `
  BEGIN
    -- function body
    RETURN param1;
  END;
  `
);
```

### Creating Triggers
```typescript
pgm.createTrigger('table_name', 'trigger_name', {
  when: 'BEFORE',
  operation: 'INSERT',
  function: 'function_name',
  level: 'ROW',
});
```

## Configuration

The migration configuration is in `pgmigrate.json`:

```json
{
  "dir": "db/migrations",
  "schema": "public",
  "migrationFileLanguage": "ts",
  "checkOrder": true,
  "createSchema": true
}
```

The `DATABASE_URL` is read from your `.env` file by the migration scripts.

## Best Practices

1. **Always write both `up` and `down` functions** - This ensures you can rollback changes
2. **Test migrations** - Run them in a development environment first
3. **Use descriptive migration names** - e.g., `add_user_profiles` instead of `migration_2`
4. **Keep migrations small and focused** - One logical change per migration
5. **Never modify existing migration files** - Create new migrations instead
6. **Use transactions** - node-pg-migrate automatically wraps migrations in transactions

## Troubleshooting

### Migration Already Applied
If you get an error that a migration is already applied:
```bash
# If needed, mark migrations as applied without running them
pnpm migrate up --fake
```

### Database Connection Issues
- Verify your `DATABASE_URL` is correct in your `.env` file
- Ensure PostgreSQL is running
- Check firewall/network settings
- For passwordless connections, make sure your PostgreSQL is configured for peer authentication

### TypeScript Issues
- Make sure `@types/node` is installed
- Verify your `tsconfig.json` includes the migrations directory
- The migration scripts use `--tsx` flag to handle TypeScript files properly

## Example Workflow

1. **Start development:**
   ```bash
   # Set up database
   pnpm migrate:up
   
   # Start development server
   pnpm dev
   ```

2. **Make database changes:**
   ```bash
   # Create new migration
   pnpm migrate:create add_user_roles
   
   # Edit the generated file
   # Run the migration
   pnpm migrate:up
   ```

3. **Deploy to production:**
   ```bash
   # Run migrations on production database
   pnpm migrate:up
   ``` 