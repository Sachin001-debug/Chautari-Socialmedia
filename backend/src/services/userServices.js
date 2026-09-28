import bcrypt from "bcrypt";
import pool from "../../config/db.js";
import { signToken } from "../middleware/authMiddleware.js";

const BCRYPT_MAX_BYTES = 72;

const asString = (value) => (typeof value === "string" ? value : "");

const normalizeEmail = (email) => asString(email).trim().toLowerCase();

const normalizePhoneNumber = (phone_number) =>
  asString(phone_number).trim().replace(/[\s()-]/g, "");

// bcrypt silently truncates past 72 bytes, so reject instead of accepting a
// password whose tail is ignored at verification time.
const assertPasswordFits = (password) => {
  if (Buffer.byteLength(asString(password), "utf8") > BCRYPT_MAX_BYTES) {
    throw new Error("Password is too long");
  }
};

export const registerUser = async ({
  username,
  email,
  password,
  phone_number,
  bio,
  profile_pic_url,
}) => {
  try {
    assertPasswordFits(password);
    const hashedPassword = await bcrypt.hash(asString(password), 10);
    const query = `
  INSERT INTO users (username, email, password, phone_number, bio, profile_pic_url)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id, username, phone_number, email, bio, profile_pic_url, created_at
`;
    const values = [
      asString(username).trim(),
      normalizeEmail(email),
      hashedPassword,
      normalizePhoneNumber(phone_number),
      asString(bio).trim() || null,
      asString(profile_pic_url).trim() || null,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation - username or email already taken
      throw new Error("Username or email already exists");
    }
    throw err;
  }
};

export const loginUser = async ({ phone_number, password }) => {
  const query = `
      SELECT id, username, email, password, phone_number, bio, profile_pic_url
      FROM users
      WHERE phone_number = $1
    `
  const { rows } = await pool.query(query, [normalizePhoneNumber(phone_number)]);

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  const user = rows[0];

  const match = await bcrypt.compare(asString(password), user.password);
  if (!match) {
    throw new Error("Password doesn't match");
  }

  const { password: _omit, ...safeUser } = user;
  return { user: safeUser, token: signToken(safeUser) };
};

export const getUserById = async (id) => {
  const query = `
    SELECT id, username, email, phone_number, bio, profile_pic_url, created_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
};

// Returns the updated user plus the URL it replaced, so the caller can delete the
// old object only after the new one is committed.
export const replaceProfilePic = async (id, profile_pic_url) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: previousRows } = await client.query(
      "SELECT profile_pic_url FROM users WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (previousRows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const { rows } = await client.query(
      `UPDATE users
       SET profile_pic_url = $1
       WHERE id = $2
       RETURNING id, username, email, phone_number, bio, profile_pic_url, created_at`,
      [profile_pic_url, id]
    );

    await client.query("COMMIT");

    return { user: rows[0], previousPic: previousRows[0].profile_pic_url };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
