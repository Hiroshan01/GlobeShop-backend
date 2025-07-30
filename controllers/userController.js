import User from "../models/users.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

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
        (error) => {
            res.status(500).json({
                message: "Fail User creation",
                error: error.message
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

//get User by ID
export async function getUserById(req, res) {
    const userId = req.params._id;

    try {
        const user = await User.findOne({ _id: userId, isBlock: false });
        if (!user) {
            return res.status(404).json({ message: "User not found" });

        }
        return res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export function userLogin(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email }).then(
        (user) => {
            if (user == null) {
                res.status(403).json({
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
//google login
export async function googleLogin(req, res) {
    try {
        const token = req.body.accessToken

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        console.log(response.data);

        let user = await User.findOne({ email: response.data.email });

        if (user == null) {
            // Create new user if not exists
            const newUser = new User({
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                email: response.data.email,
                img: response.data.picture,
                password: "googleLogin", // Placeholder password
                role: "customer" // Default role
            });

            user = await newUser.save(); // Save and assign to user variable
        }

        // Generate JWT token for both new and existing users
        const jwtToken = jwt.sign(
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
            message: user.isNew ? "User created and logged in successfully" : "Login successful",
            token: jwtToken,
            role: user.role
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({
            message: "Google login failed",
            error: error.message
        });
    }
}



const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_PASSWORD
    }
});

export async function sendOtp(req, res) {
    try {
        const randomOtp = Math.floor(100000 + Math.random() * 900000);
        const email = req.body.email;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        //check if email exists 
        const user = await User.find({ email: email });
        if (user == null) {
            return res.status(404).json({
                message: "Email not found"
            });
        }
        //delet all otp
        await OTP.deleteMany({ email: email });

        const message = {
            from: process.env.GOOGLE_MAIL, // Use environment variable
            to: email,
            subject: "Your OTP for verification",
            text: `This is your OTP for verification: ${randomOtp}`,
            html: `<p>This is your OTP for verification: <strong>${randomOtp}</strong></p>` // Optional HTML format
        };
        const otpData = new OTP({
            email: email,
            otp: randomOtp
        })
        await otpData.save(); // Save OTP to the database
        // Send email with proper callback handling
        const info = await transporter.sendMail(message);

        console.log('Email sent successfully:', info.messageId);

        res.status(200).json({
            message: "OTP sent successfully",
            success: true,

        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message,
            success: false
        });
    }
}

export async function resetPassword(req, res) {
    const otp = req.body.otp;
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const response = await OTP.findOne({ email: email })

    if (response == null) {
        return res.status(500).json({
            message: "OTP not found plese tray again"
        });
    }
    if (otp == response.otp) {
        await OTP.deleteMany({ email: email }); // Delete OTP after successful verification

        const hashPassword = bcrypt.hashSync(newPassword, 10);
        const response2 = await User.updateOne(
            { email: email },
            { password: hashPassword }
        )
        res.json({
            message: "Password reset successful",
        })

    } else {
        res.status(403).json({
            message: "Invalid OTP"
        });
    }
}
//update user Profile
export async function updateUserProfile(req, res) {
    const userId = req.params._id;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.email) user.email = req.body.email;

        // Save the updated user
        await user.save();

        res.status(200).json({
            message: "User profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
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
