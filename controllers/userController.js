import User from "../models/users.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config()


export function createUser(req, res) {
    //check admin
    if (req.body.role == "admin") {
        if (req.user != null) {
            if (req.user.role != "admin") {
                res.status(403).json({
                    message: "You are not authorized to create admin account"
                })
                return
            }

        } else {
            res.status(403).json({
                message: "You are not authorized to create an admin please login first"
            })
            return
        }
    }
    const hashPassword = bcrypt.hashSync(req.body.password, 10)
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPassword,
        role: req.body.role,
    })
    user.save().then(
        () => {
            res.json({
                message: "User created successfully"
            })
        }
    ).catch(
        () => {
            res.status(500).json({
                message: "Fail User creation",
            })
        }
    )

}
//get Users test
export async function getUsers(req, res) {
    try {
        const user = await User.find()
        res.status(200).json(user)
    } catch {
        res.status(500).json({
            message: "Not users available"
        })
    }

}

export function userLogin(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({
                    message: "User not found"
                })
            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password) //compare
                if (isPasswordCorrect) {
                    // Generate encrypt
                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            img: user.img
                        },
                        process.env.JWT_KEY
                    )
                    res.json({
                        message: "Login successful",
                        token: token,
                        role: user.role
                    })
                } else {
                    res.status(401).json({
                        message: "Invalid password"
                    })
                }
            }
        }
    )

}

// admin check function
export function isAdmin(req) {
    if (req.user == null) {
        return false; // No user is logged in
    }
    if (req.user.role !== "admin") {
        return false; // User is not an admin
    }
    return true; // User is an admin
}
