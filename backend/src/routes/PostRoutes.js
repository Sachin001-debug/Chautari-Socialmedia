import express from 'express'
import authenticate from '../middleware/authMiddleware.js';
import { createImagePost, createImagePostUploadUrl, getMyImagePostsController, getImagePostByIdController, unlikePostController, likePostController, getCommentsController, addCommentController } from '../controller/PostImageController.js';




const postImageRoute = express.Router();


postImageRoute.post(
  "/upload-url",
  authenticate,
  createImagePostUploadUrl
);
postImageRoute.post(
  "/",
  authenticate,
  createImagePost
);
postImageRoute.get('/my-posts', authenticate, getMyImagePostsController);
postImageRoute.get('/:id', authenticate, getImagePostByIdController);

//like 
postImageRoute.post("/:id/like", authenticate, likePostController);
postImageRoute.delete("/:id/like", authenticate, unlikePostController);

//comments
postImageRoute.get("/:id/comments", authenticate, getCommentsController);
postImageRoute.post("/:id/comments", authenticate, addCommentController);
export default postImageRoute;
