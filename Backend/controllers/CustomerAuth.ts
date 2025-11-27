import Customer from "../models/Customer";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";




export const Csignup = async (req:Request, res:Response) => {
  const { name, email, password } = req.body;
  console.log(email);
  try {
    // Check if user already exists
    const existingUser = await Customer.findOne({ email });
    console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
    });

    if (customer) {
      res.status(201).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const Clogin = async (req:Request, res:Response) => {
  const { email, password } = req.body;

  try {
    // Find user
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Successful login
    res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
    });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};
