import { randomUUID } from "crypto";
import supabase, { IMAGE_POST_BUCKET } from "../../supabase/supabase.js";
import pool from "../../config/db.js";

export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const imagePostPrefixFor = (userId) => `user/${userId}/`;

export const buildImagePostPath = (userId, contentType) =>
  `${imagePostPrefixFor(userId)}${randomUUID()}${EXTENSION_BY_CONTENT_TYPE[contentType]}`;

export const publicImagePostUrlFor = (objectPath) =>
  supabase.storage
    .from(IMAGE_POST_BUCKET)
    .getPublicUrl(objectPath)
    .data.publicUrl;

// The bucket name must never be hardcoded in a client, so URLs are built here
// and older rows that stored a full public URL (under a misnamed bucket) are
// normalised back to a bare object path on read.
const PUBLIC_URL_MARKER = "/storage/v1/object/public/";

const objectPathFrom = (value) => {
  if (!value) return null;

  const markerIndex = value.indexOf(PUBLIC_URL_MARKER);

  // Already a bare object path - leave it alone, or its first segment
  // ("user/...") would be mistaken for a bucket and stripped.
  if (markerIndex === -1) return value;

  const afterPrefix = value.slice(markerIndex + PUBLIC_URL_MARKER.length);
  const segments = afterPrefix.split("/");

  // drop the bucket segment that immediately follows the public prefix
  return segments.slice(1).join("/");
};

export const normalizeImagePostObjectPath = objectPathFrom;

export const publicImagePostUrlForObjectPath = (value) => {
  const objectPath = objectPathFrom(value);

  return objectPath ? publicImagePostUrlFor(objectPath) : null;
};

//noow to post single  im
export const signImagePostUpload = async ({userId,contentType,}) => {

    const objectPath= buildImagePostPath(userId, contentType);

    const{data, error}= await supabase.storage.from(IMAGE_POST_BUCKET).createSignedUploadUrl(objectPath);

    if (error) {
    throw new Error(
      `Could not create a signed upload URL: ${error.message}`
    );
  }

  return {
    bucket: IMAGE_POST_BUCKET,
    objectPath,
    token: data.token,
    contentType,
    maxBytes: MAX_UPLOAD_BYTES,
  };

}

export const imagePostServices = async ({
  user_id: userId,
  caption,
  hashtags,
  image_url: imageUrl,
}) => {
  // Store the bare object path, never a public URL. A URL in this column bakes
  // in whichever bucket was named at write time, so renaming the bucket later
  // would break every existing row.
  const objectPath = objectPathFrom(imageUrl);

  const query = `
    INSERT INTO image_posts (
      user_id,
      caption,
      hashtags,
      image_url
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      user_id,
      caption,
      hashtags,
      image_url,
      created_at
  `

  const { rows } = await pool.query(query, [
    userId,
    caption,
    hashtags,
    objectPath,
  ])

  return { ...rows[0], image_url: publicImagePostUrlFor(rows[0].image_url) }
}

//to display the image post in profile of user logged in
export const getImagePostsByUserIdServices = async ({ userId }) => {
  const query = `
    SELECT
      id,
      user_id,
      caption,
      hashtags,
      image_url,
      created_at
    FROM image_posts
    WHERE user_id = $1
    ORDER BY created_at DESC
  `

  const { rows } = await pool.query(query, [userId])

  // Hand the client a ready-to-render URL so the bucket name lives in one place.
  return rows.map((row) => ({
    ...row,
    image_url: publicImagePostUrlForObjectPath(row.image_url),
  }))
}

// to fetch a single image post by ID with user details
export const getImagePostByIdServices = async ({ id }) => {
  const query = `
    SELECT
      p.id,
      p.user_id,
      p.caption,
      p.hashtags,
      p.image_url,
      p.created_at,
      u.username,
      u.profile_pic_url
    FROM image_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
  `

  const { rows } = await pool.query(query, [id])
  if (rows.length === 0) return null

  const row = rows[0]
  return {
    ...row,
    image_url: publicImagePostUrlForObjectPath(row.image_url),
    user: {
      id: row.user_id,
      username: row.username,
      profile_pic_url: row.profile_pic_url,
    },
  }
}
