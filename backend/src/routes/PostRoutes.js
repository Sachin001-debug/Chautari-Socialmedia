import express from 'express'
import authenticate from '../middleware/authMiddleware.js';
import { createImagePost, createImagePostUploadUrl, getMyImagePostsController } from '../controller/PostImageController.js';



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
postImageRoute.get('/my-posts', authenticate, getMyImagePostsController)

export default postImageRoute;