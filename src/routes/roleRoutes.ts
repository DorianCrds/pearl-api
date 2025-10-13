// src/routes/roleRoutes.ts
import { Router } from 'express';
import { roleController } from '../controllers/roleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const roleRouter = Router();

// Public route
roleRouter.get('/', roleController.getAllRoles);
roleRouter.get('/:id', roleController.getRoleById);

// Protected routes (require auth)
roleRouter.post('/', authMiddleware, roleController.createRole);
roleRouter.put('/:id', authMiddleware, roleController.updateRole);
roleRouter.delete('/:id', authMiddleware, roleController.deleteRole);

export default roleRouter;
