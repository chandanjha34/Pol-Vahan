import { Request, Response } from "express";
import Dealer from "../models/Dealer";
import bcrypt from "bcryptjs";
// Helper to generate JWT
export const Dsignup = async (req:Request, res:Response) => {
  const { name, email, Dealer_ID, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await Dealer.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "Dealer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const dealer = await Dealer.create({
      name,
      email,
      Dealer_ID,
      password: hashedPassword,
    });

    if (dealer) {
      res.status(201).json({
        _id: dealer._id,
        name: dealer.name,
        email: dealer.email,
        dealerID: dealer.Dealer_ID,
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
export const Dlogin = async (req:Request, res:Response) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await Dealer.findOne({ email });
    console.log(user)
    console.log(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dealerID: user.Dealer_ID,
    });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};
