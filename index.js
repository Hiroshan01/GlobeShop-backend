import express from 'express'
import bodyParser from 'body-parser';
import userRoute from './routes/userRouts.js';
import connectDB from './config/configDB.js';
import productRoute from './routes/productRouter.js';
import jwt from "jsonwebtoken"
import orderedRoute from './routes/orderRouter.js';


let app = express();

app.use(bodyParser.json())//Middeleware
app.use(express.urlencoded({ extended: true }))

//Middleware
app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization")
        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, "hiroshan",
                (err, decoded) => {
                    if (decoded != null) {
                        req.user = decoded
                        next()
                    } else {
                        console.log("Invalid token:", err.message);
                        res.status(403).json({
                            message: "Invalid Token "
                        })
                    }
                }
            )

        } else {
            next()
        }

    }
)

connectDB()
//Routers
app.use("/users", userRoute)
app.use("/product", productRoute)
app.use("/order", orderedRoute)


app.listen(5000, () => {
    console.log("Server is running on 5000")
})