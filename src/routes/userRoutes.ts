// src/routes/userRoutes.ts
import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = express.Router();

// Public routes
userRouter.post('/', userController.createUser);

// Protected routes (require auth)
userRouter.get('/', authMiddleware, userController.getAllUsers);
userRouter.get('/:id', authMiddleware, userController.getUserById);
userRouter.put('/:id', authMiddleware, userController.updateUser);
userRouter.delete('/:id', authMiddleware, userController.deleteUser);

export default userRouter;
