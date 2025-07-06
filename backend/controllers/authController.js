import userModel from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, city, state, pinCode,lat,lon } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      address: {
        coordinates: {
          lat,
          lon
        },
        city,
        state,
        pincode: pinCode
      },
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict'
    });
    res.status(200).json({
      token,
      username: user.name,
      id: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
}

// Helper function to generate JWT token
const generateToken = (userId) => {
  const token = jwt.sign({ userId }, 'secretPass', { expiresIn: '1h' });
  return token;
}

export const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}
