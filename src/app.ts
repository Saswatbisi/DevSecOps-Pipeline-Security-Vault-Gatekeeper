import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import vulnerableRouter from './routes/vulnerable';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// 1. Mount Global Middlewares
app.use(cors({
  origin: true, // Allow requests from origin
  credentials: true // Allow cookies header passing
}));
app.use(express.json());
app.use(cookieParser()); // Enables reading req.cookies

// 2. Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Auth System API'
  });
});

// 3. Register Routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/vulnerable', vulnerableRouter);

// 4. Centralized Error Handler (must be registered last!)
app.use(errorHandler);

export default app;
