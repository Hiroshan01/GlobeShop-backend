import express from 'express'
import { createOrder, getOrder } from '../controllers/orderController.js';


const orderedRoute = express.Router();

orderedRoute.post("/", createOrder)
orderedRoute.get("/", getOrder)

export default orderedRoute; 