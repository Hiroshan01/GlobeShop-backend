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
        (err) => {
            res.status(500).json({
                message: "Product not created",
                error: err
            })
        }
    )
}

//Product delete
export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to delete product"
        })
        return
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

//Product Update
export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to update to product"
        })
        return
    }
    const productId = req.params.productId
    const updateProduct = req.body
    try {
        await Product.updateOne(
            { productId: productId },
            updateProduct
        )
        res.json({
            message: "Product update successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Internal sever error",
            error: err
        })
    }
}

//Get Product by Id
export async function getProductById(req, res) {
    const productId = req.params.productId

    try {
        const product = await Product.findOne(
            { productId: productId }// Retrieve product from DB by Id
        )
        if (product == null) {
            res.status(404).json({
                message: "Product  not found"
            })
            return
        }
        if (product.isAvailable) {
            res.json(product)
        } else {
            if (!isAdmin(req)) {
                res.status(404).json({
                    message: "Product is not found"
                })
                return
            }
            else {
                res.json(product) // If admin
            }
        }

    } catch {

    }
}