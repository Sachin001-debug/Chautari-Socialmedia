import express from 'express'
import authenticate from '../middleware/authMiddleware.js';
import { createImagePost, createImagePostUploadUrl, getMyImagePostsController, getImagePostByIdController } from '../controller/PostImageController.js';



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

export default postImageRoute;
