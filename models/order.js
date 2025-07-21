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
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    total: {
        type: Number,
        required: true
    },
    product: [
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
                    type: String,
                    required: true
                }

            },
            quantity: {
                type: Number,

            }
        }
    ],
    date: {
        type: Date,
        default: Date.now()
    }
})

const Order = mongoose.model("orders", orderSchema)
export default Order