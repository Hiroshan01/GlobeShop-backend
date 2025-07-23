import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,  // Changed to false
        default: ""       // Added default
    },
    address: {
        type: String,
        required: false,  // Changed to false
        default: ""       // Added default
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    labelTotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    products: [
        {
            productInfo: {
                productId: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                altName: [{
                    type: String
                }],
                description: {
                    type: String,
                    required: true
                },
                image: [{
                    type: String
                }],
                price: {
                    type: Number,
                    required: true
                }
            },
            quantity: {
                type: Number,
                min: 1
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model("orders", orderSchema)
export default Order