/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('posts', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    body: {
      type: 'text',
      notNull: true,
    },
    category: {
      type: 'varchar(100)',
      notNull: true,
    },
    userId: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    photo: {
      type: 'varchar(500)',
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

  // Create indexes for better performance
  pgm.createIndex('posts', 'userId');
  pgm.createIndex('posts', 'category');
  pgm.createIndex('posts', 'createdAt');

  // Create trigger for updating timestamp
  pgm.createTrigger('posts', 'update_post_timestamp', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_timestamp',
    level: 'ROW',
  });
};

export const down = (pgm) => {
  pgm.dropTrigger('posts', 'update_post_timestamp');
  pgm.dropIndex('posts', 'createdAt');
  pgm.dropIndex('posts', 'category');
  pgm.dropIndex('posts', 'userId');
  pgm.dropTable('posts');
};
