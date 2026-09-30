
import {
  ALLOWED_CONTENT_TYPES,
  signImagePostUpload,
  imagePostServices,
  getImagePostsByUserIdServices,
  getImagePostByIdServices,
   likeCountServices,
  unlikePostService,
  getLikeCountService,
    saveCommentsServices,
  getCommentsServices,
} from "../services/PostImageServices.js";

export const createImagePostUploadUrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contentType } = req.body;

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return res.status(400).json({
        message: "Unsupported file type",
      });
    }

    const upload = await signImagePostUpload({
      userId,
      contentType,
    });

    return res.status(200).json(upload);
  } catch (err) {
    next(err);
  }
};

//create image post
export const createImagePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { caption = "", image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    const hashtags =
  caption.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.toLowerCase()) || []

    const post = await imagePostServices({
      user_id: userId,
      caption,
      hashtags,
      image_url,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    next(err);
  }
};

//to get uploaded image post
export const getMyImagePostsController= async (req, res, next) => {
  try {
    const userId = req.user.id;

    const posts = await getImagePostsByUserIdServices({
      userId,
    });

    return res.status(200).json({
      posts,
    });
  } catch (err) {
    next(err);
  }
};

//to get single image post by ID
export const getImagePostByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await getImagePostByIdServices({ id, userId: req.user?.id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      post,
    });
  } catch (err) {
    next(err);
  }
};
export const likePostController = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    await likeCountServices({ postId, userId });
    const { like_count } = await getLikeCountService({ postId });

    return res.status(200).json({ liked: true, like_count });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const unlikePostController = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    await unlikePostService({ postId, userId });
    const row = await getLikeCountService({ postId });

    if (!row) return res.status(404).json({ message: "Post not found" });

    return res.status(200).json({ liked: false, like_count: row.like_count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const addCommentController = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const text = (req.body.text || "").trim();

    if (!Number.isInteger(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }
    if (!text || text.length > 1000) {
      return res
        .status(400)
        .json({ message: "Comment must be 1 to 1000 characters" });
    }

    const comment = await saveCommentsServices({
      postId,
      userId: req.user.id,
      text,
    });

    return res.status(201).json({ comment });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getCommentsController = async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const comments = await getCommentsServices({ postId });
    return res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};