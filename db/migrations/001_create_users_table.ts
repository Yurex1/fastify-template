import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    email: {
      type: 'varchar(320)',
      unique: true,
    },
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    createdAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
    updatedAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createFunction(
    'update_timestamp',
    [],
    {
      replace: true,
      language: 'plpgsql',
      returns: 'TRIGGER',
    },
    `
    BEGIN
       NEW."updatedAt" = now();
       RETURN NEW;
    END;
    `,
  );

  pgm.createTrigger('users', 'update_user_timestamp', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_timestamp',
    level: 'ROW',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTrigger('users', 'update_user_timestamp');

  pgm.dropFunction('update_timestamp', []);

  pgm.dropTable('users');
}
