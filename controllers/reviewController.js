import Review from "../models/reviews.js";

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