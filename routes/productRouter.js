import express from 'express'
import { createProduct, deleteProduct, getProduct } from '../controllers/productController.js';

const productRoute = express.Router();

productRoute.post("/", createProduct)
productRoute.get("/", getProduct)
productRoute.delete("/:productId", deleteProduct)
export default productRoute;