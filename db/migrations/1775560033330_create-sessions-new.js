/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('sessions', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    userId: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    deviceId: {
      type: 'text',
      notNull: true,
      default: 'unknown',
    },
    refreshToken: {
      type: 'text',
      notNull: true,
    },
    expiresAt: {
      type: 'timestamp',
      notNull: true,
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

  pgm.addConstraint('sessions', 'sessions_user_device_unique', {
    unique: ['userId', 'deviceId'],
  });

  // Create indexes for better performance
  pgm.createIndex('sessions', 'refreshToken');

  // Create trigger for updating timestamp
  pgm.createTrigger('sessions', 'update_session_timestamp', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_timestamp',
    level: 'ROW',
  });
};

export const down = (pgm) => {
  pgm.dropTrigger('sessions', 'update_session_timestamp');
  pgm.dropIndex('sessions', 'refreshToken');
  pgm.dropIndex('sessions', 'userId');
  pgm.dropIndex('sessions', 'deviceId');
  pgm.dropTable('sessions');
};
