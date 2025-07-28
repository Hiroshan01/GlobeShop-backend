import express from 'express'
import { createOrder, getOrder, updateOderStatus } from '../controllers/orderController.js';


const orderedRoute = express.Router();

orderedRoute.post("/", createOrder)
orderedRoute.get("/", getOrder)
orderedRoute.put("/:orderId/:status", updateOderStatus)

export default orderedRoute; 