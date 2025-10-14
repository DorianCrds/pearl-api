// src/routes/userRoutes.ts
import express from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';

const userRouter = express.Router();

// Public routes
userRouter.post('/', userController.createUser);

// Protected routes (require auth)
userRouter.get('/', authenticate, userController.getAllUsers);
userRouter.get('/:id', authenticate, userController.getUserById);
userRouter.put('/:id', authenticate, userController.updateUser);
userRouter.delete('/:id', authenticate, userController.deleteUser);

export default userRouter;
