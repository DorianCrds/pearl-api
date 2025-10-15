// src/routes/authRoutes.ts
import { Router } from 'express';
import { authController } from '../controllers/authController';

const authRouter = Router();

// Public routes
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

export default authRouter;
