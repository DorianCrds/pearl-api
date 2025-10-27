// src/routes/authRoutes.ts
import { Router } from 'express';
import { authController } from '../controllers/authController';
import {validate} from "../middlewares/validate";
import {loginSchema, refreshTokenSchema, registerSchema} from "../validators/authValidator";

const authRouter = Router();

// Public routes
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);

export default authRouter;
