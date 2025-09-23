/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define the POST function to handle login requests
export async function POST(req: NextRequest) {
  // Connect to the MongoDB database
  await connectDB();

  try {
    // Extract phone and password from the request body
    const { phone, password } = await req.json();

    // Validate that both fields are present
    if (!phone || !password) {
      return NextResponse.json({ message: 'Phone number and password are required' }, { status: 400 });
    }

    // Find the user by their phone number
    const user = await User.findOne({ phone });

    // Check if the user exists
    if (!user) {
      return NextResponse.json({ message: 'Invalid phone number or password' }, { status: 401 });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // Check if the passwords match
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid phone number or password' }, { status: 401 });
    }
    // Create a JWT token for the authenticated user
    const token = jwt.sign(
      { id: user._id, name: user.name, phone: user.phone },
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '7d' } 
    );

    // Return a success response with the token and user data
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    // Return a 500 status code for internal server errors
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}