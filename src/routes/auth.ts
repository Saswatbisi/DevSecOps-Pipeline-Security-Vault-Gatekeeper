import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CustomError } from '../middlewares/errorHandler';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';

// 1. POST /api/auth/register - Register a new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error: CustomError = new Error('Email is already registered.');
      error.statusCode = 400;
      return next(error);
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/auth/login - Authenticate user, generate JWT & set HTTP-only cookie
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: CustomError = new Error('Please provide both email and password.');
      error.statusCode = 400;
      return next(error);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      const error: CustomError = new Error('Invalid email or password.');
      error.statusCode = 401;
      return next(error);
    }

    // Verify password via model schema instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error: CustomError = new Error('Invalid email or password.');
      error.statusCode = 401;
      return next(error);
    }

    // Generate JWT access token (valid for 1 hour)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side scripts accessing token
      secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
      maxAge: 3600000 // 1 hour in milliseconds
    });

    res.json({
      message: 'Successfully logged in!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/auth/logout - Clear cookie session token
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Successfully logged out! Cookie session token cleared.' });
});

export default router;
