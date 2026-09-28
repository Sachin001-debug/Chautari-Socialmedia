export const up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(50)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    phone_number: { type: 'varchar(20)', notNull: true },
    bio: { type: 'text' },
    profile_pic_url: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
}

export const down = (pgm) => {
  pgm.dropTable('users')
}