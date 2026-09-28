export const up = (pgm) => {
  pgm.createTable("image_posts", {
    id: "id",

    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },

    caption: {
      type: "varchar(220)",
      notNull: false,
    },

    image_url: {
      type: "text",
      notNull: true,
    },

    hashtags: {
      type: "text",
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("image_posts", "user_id");
};

export const down = (pgm) => {
  pgm.dropTable("image_posts");
};