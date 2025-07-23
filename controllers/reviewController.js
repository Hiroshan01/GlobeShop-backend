import Review from "../models/reviews.js";
import { isAdmin } from "./userController.js";

export async function createReview(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "Can not review, Please Login and try again"
        })
        return
    }
    const {
        productId,
        userId,
        rating,
        reviewText
    } = req.body;

    if (!productId || !userId || !rating || !reviewText) {
        res.status(400).json({
            message: "All fields are required."
        })
        return
    }

    if (rating < 1 || rating > 5) {
        res.status(404).json({
            message: "Rating must be between 1 and 5."
        })
        return
    }

    try {
        const newReview = new Review(
            req.body
        )
        const createdReview = await newReview.save();

        res.json({
            message: "Review created successfully",
            createdReview: createdReview
        })
    } catch (err) {
        res.status(500).json({
            message: 'Review not created successfully ',
            error: err
        })
    }
}

export async function getReview(req, res) {
    try {
        const review = await Review.find()
        res.status(200).json(review)
    } catch {
        res.status(500).json({
            message: "Not Review"
        })
    }

}

export async function updateReview(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to delete product"
        })
        return
    }

    const reviewId = req.params._id
    const updateReview = req.body

    // if (!productId || !userId || !rating || !reviewText) {
    //     res.status(400).json({
    //         message: "All fields are required."
    //     })
    //     return
    // }

    if (updateReview.rating < 1 || updateReview.rating > 5) {
        res.status(404).json({
            message: "Rating must be between 1 and 5."
        })
        return
    }

    try {
        await Review.updateOne(
            { reviewId: reviewId },
            updateReview
        )
        res.json({
            message: "Review update successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Internal sever error",
            error: err
        })
    }
}

//delete review
