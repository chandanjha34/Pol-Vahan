import service from "../models/Service";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";



export const Ssignup = async (req:Request, res:Response) => {
  console.log(req.body);
  const { name, email, Service_ID, password } = req.body;

  try {
    // Check if user already exists
    console.log(email);
    const existingUser = await service.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Service Center already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const Service = await service.create({
      name,
      email,
      Service_ID,
      password: hashedPassword,
    });

    if (Service) {
      res.status(201).json({
        _id: Service._id,
        name: Service.name,
        email: Service.email,
        Service_ID: Service.Service_ID,
      });
    } else {
      res.status(400).json({ message: "Invalid service center data" });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const Slogin = async (req:Request, res:Response) => {
  const { email, password } = req.body;

  try {
    // Find user
    const Service = await service.findOne({ email });
    if (!Service) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login
    res.json({
      _id: Service._id,
      name: Service.name,
      email: Service.email,
      Service_ID: Service.Service_ID,
    });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};
