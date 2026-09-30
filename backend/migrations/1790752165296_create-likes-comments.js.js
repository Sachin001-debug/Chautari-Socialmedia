export const up = (pgm) => {
  pgm.addColumns('comments', {
    parent_id: { type: 'integer', references: 'comments(id)', onDelete: 'CASCADE' },
    like_count: { type: 'integer', notNull: true, default: 0 },
    edited_at: { type: 'timestamp' },
  })
  pgm.createIndex('comments', 'parent_id')

  pgm.createTable('comment_likes', {
    comment_id: { type: 'integer', notNull: true, references: 'comments(id)', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  })
  pgm.addConstraint('comment_likes', 'comment_likes_pkey', { primaryKey: ['comment_id', 'user_id'] })

  pgm.sql(`
    CREATE FUNCTION bump_comment_likes() RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
      END IF;
      RETURN NULL;
    END $$ LANGUAGE plpgsql;

    CREATE TRIGGER comment_likes_trg AFTER INSERT OR DELETE ON comment_likes
      FOR EACH ROW EXECUTE FUNCTION bump_comment_likes();
  `)
}

export const down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS comment_likes_trg ON comment_likes;
    DROP FUNCTION IF EXISTS bump_comment_likes();
  `)
  pgm.dropTable('comment_likes')
  pgm.dropColumns('comments', ['parent_id', 'like_count', 'edited_at'])
}