import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { User } from '../models/User';

const router = Router();

// 1. GET /api/users/profile - Fetch profile of logged-in user (Requires active authentication)
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password'); // Exclude password hash

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/users - Fetch full users list (Requires Admin role authorization)
router.get('/', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password'); // Exclude password hashes
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
