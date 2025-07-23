import Order from '../models/order.js'
import Product from '../models/product.js'

export async function createOrder(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "Please Login and try again"
        })
        return
    }

    // Combine user info with request body
    const orderInfo = {
        ...req.user,
        ...req.body  // This will include phone, address, and products from your JSON
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
                    image: item.images,  // Changed from 'images' to 'image' to match schema
                    price: item.price
                    // Removed labelledPrice from productInfo as it's not in the schema
                },
                quantity: orderInfo.products[i].qty  // Changed from 'qty' to 'quantity' to match schema
            }

            total += (item.price * orderInfo.products[i].qty)
            labelTotal += (item.labelledPrice * orderInfo.products[i].qty)
        }

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address || "",  // Provide default empty string
            phone: orderInfo.phone || "",      // Provide default empty string
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
            error: err.message || err  // Return the actual error message
        })
    }
}