import express from 'express'
import { createOrder } from '../controllers/orderController.js';


const orderedRoute = express.Router();

orderedRoute.post("/", createOrder)

export default orderedRoute; 