
import {
  ALLOWED_CONTENT_TYPES,
  signImagePostUpload,
  imagePostServices,
  getImagePostsByUserIdServices,
  getImagePostByIdServices,
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

    const post = await getImagePostByIdServices({ id });
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
