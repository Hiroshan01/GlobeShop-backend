import express from 'express'
import { createProduct, deleteProduct, getProduct, getProductById, updateProduct } from '../controllers/productController.js';

const productRoute = express.Router();

productRoute.post("/", createProduct)
productRoute.get("/", getProduct)
productRoute.delete("/:productId", deleteProduct)
productRoute.put("/:productId", updateProduct)
productRoute.get("/:productId", getProductById)

export default productRoute; 