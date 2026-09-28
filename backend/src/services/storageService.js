import { randomUUID } from "crypto";
import supabase, { PFP_BUCKET, SUPABASE_URL } from "../../supabase/supabase.js";

export const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// The client never picks its own path. Every object lives under a folder derived
// from the authenticated user id, so a signed URL can never be minted for
// someone else's folder.
const pfpPrefixFor = (userId) => `user-${userId}/`;


//creates unique path
export const buildPfpPath = (userId, contentType) =>
  `${pfpPrefixFor(userId)}${randomUUID()}${EXTENSION_BY_CONTENT_TYPE[contentType]}`;


//we will now crete public for user so that we can store on postgres
export const publicUrlFor = (objectPath) =>
  supabase.storage.from(PFP_BUCKET).getPublicUrl(objectPath).data.publicUrl;

const publicUrlPrefix = () =>
  `${SUPABASE_URL}/storage/v1/object/public/${PFP_BUCKET}/`;

// Reverse of publicUrlFor, so we can tell which stored URLs are ours to delete.
const objectPathFromPublicUrl = (url) => {
  if (typeof url !== "string") return null;

  const prefix = publicUrlPrefix();
  if (!url.startsWith(prefix)) return null;

  return url.slice(prefix.length);
};

//check if he is the owner of that
export const isPfpPathOf = (objectPath, userId) => {
  const prefix = pfpPrefixFor(userId);

  return (
    typeof objectPath === "string" &&
    objectPath.startsWith(prefix) &&
    !objectPath.slice(prefix.length).includes("/")
  );
};

export const pfpExists = async (objectPath) => {
  // createSignedUrl errors on a missing object, so it doubles as an existence
  // check without listing the folder.
  const { error } = await supabase.storage.from(PFP_BUCKET).createSignedUrl(objectPath, 1);

  return !error;
};

export const signPfpUpload = async ({ userId, contentType }) => {
  const objectPath = buildPfpPath(userId, contentType);

  const { data, error } = await supabase.storage
    .from(PFP_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error) {
    throw new Error(`Could not create a signed upload URL: ${error.message}`);
  }

  return {
    bucket: PFP_BUCKET,
    objectPath,
    token: data.token,
    contentType,
    maxBytes: MAX_UPLOAD_BYTES,
  };
};

// Best-effort: a failed delete must not fail the request, the URL is already
// replaced and an orphan costs storage, not correctness.
export const deleteStoredPfp = async (publicUrl, userId) => {
  const objectPath = objectPathFromPublicUrl(publicUrl);

  if (!objectPath || !isPfpPathOf(objectPath, userId)) return false;

  const { error } = await supabase.storage.from(PFP_BUCKET).remove([objectPath]);

  return !error;
};
