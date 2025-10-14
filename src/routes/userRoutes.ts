// src/routes/userRoutes.ts
import express from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const userRouter = express.Router();

// Protected routes
userRouter.get('/', authenticate, authorizeRoles('ADMIN'), userController.getAllUsers);
userRouter.get('/:id', authenticate, authorizeRoles('ADMIN'), userController.getUserById);
userRouter.post('/', authenticate, authorizeRoles('ADMIN'), userController.createUser);
userRouter.put('/:id', authenticate, authorizeRoles('ADMIN'), userController.updateUser);
userRouter.delete('/:id', authenticate, authorizeRoles('ADMIN'), userController.deleteUser);

export default userRouter;
