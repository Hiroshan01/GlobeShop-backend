import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function getProduct(req, res) {
    try {
        if (isAdmin(req)) {
            const product = await Product.find()
            res.json(product)
        } else {
            const product = await Product.find({ isAvailable: true })
            res.json(product)
        }

    } catch {
        res.json({
            message: "Failed to get product",
            error: err
        })
    }

}

export function createProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not unauthorized to add product"
        })
        return
    }
    const product = new Product(
        req.body
    )
    product.save().then(
        () => {
            res.json({
                message: "Product created"
            })
        }

    ).catch(
        () => {
            res.json({
                message: "Product not created"
            })
        }
    )
}

//Product delete
export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        req.status(403).json({
            message: "You are not authorized to delete product"
        })
    }
    try {
        await Product.deleteOne({ productId: req.params.productId })//URL to set /:productId
        res.json({
            message: "Product deleted successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete product",
            error: err
        })
    }
}