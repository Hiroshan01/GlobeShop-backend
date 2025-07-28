import Order from '../models/order.js'
import Product from '../models/product.js'
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "Please Login and try again"
        })
        return
    }

    const orderInfo = {
        ...req.user,
        ...req.body
    }

    if (orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName
    }

    // Order ID Generation
    let orderId = "CBC00001"
    const lastOrder = await Order.find().sort({ date: -1 }).limit(1)

    if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId
        const lastOrderNumberString = lastOrderId.replace("CBC", "")
        const lastOrderNumber = parseInt(lastOrderNumberString)
        const newOrderNumber = lastOrderNumber + 1
        const newOrderStringNumber = String(newOrderNumber).padStart(5, '0')
        orderId = "CBC" + newOrderStringNumber
    }

    try {
        let total = 0
        let labelTotal = 0
        const products = []

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId: orderInfo.products[i].productId })
            if (item == null) {
                res.status(404).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " not found"
                })
                return
            }
            if (item.isAvailable == false) {
                res.status(404).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " not available right now"
                })
                return
            }

            products[i] = {
                productInfo: {
                    productId: item.productId,
                    name: item.ProductName,
                    altName: item.altName,
                    description: item.description,
                    image: item.images,
                    price: item.price

                },
                quantity: orderInfo.products[i].qty
            }

            total += (item.price * orderInfo.products[i].qty)
            labelTotal += (item.labelledPrice * orderInfo.products[i].qty)
        }

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address || "",
            phone: orderInfo.phone || "",
            total: total,
            products: products,
            labelTotal: labelTotal
        })

        const createdOrder = await order.save()
        res.json({
            message: "Order created successfully",
            createdOrder: createdOrder
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to create order",
            error: err.message || err
        })
    }
}


//Get Order
export async function getOrder(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "Pleas Login and try again"
        })
        return
    }
    try {
        if (req.user.role == "admin") {
            const orders = await Order.find();
            res.json(orders)
        } else {
            const orders = await Order.find({ email: req.user.email });
            res.json(orders)
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: err
        })
    }
}

// Order Update
export async function updateOderStatus(req, res) {
    // Fix: Check if user is NOT an admin, then deny access
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to update orders status"
        });
    }

    try {
        const { orderId, status } = req.params; // Destructure params

        await Order.updateOne(
            { orderId: orderId },
            { status: status }
        );

        return res.status(200).json({
            message: "Order status updated successfully"
        });
    } catch (e) {
        res.status(500).json({
            message: "Failed to update order status"
        });
    }
}