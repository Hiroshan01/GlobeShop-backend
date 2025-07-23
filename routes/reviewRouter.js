import express from 'express'
import { createReview, getReview, updateReview } from '../controllers/reviewController.js';



const reviewRouter = express.Router();

reviewRouter.post("/", createReview)
reviewRouter.get("/", getReview)
reviewRouter.put("/:id", updateReview)

export default reviewRouter; 