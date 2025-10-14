// src/routes/roleRoutes.ts
import { Router } from 'express';
import { roleController } from '../controllers/roleController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const roleRouter = Router();

// Public routes
roleRouter.get('/', roleController.getAllRoles);
roleRouter.get('/:id', roleController.getRoleById);

// Protected routes
roleRouter.post('/', authenticate, authorizeRoles('ADMIN'), roleController.createRole);
roleRouter.put('/:id', authenticate, authorizeRoles('ADMIN'), roleController.updateRole);
roleRouter.delete('/:id', authenticate, authorizeRoles('ADMIN'), roleController.deleteRole);

export default roleRouter;
