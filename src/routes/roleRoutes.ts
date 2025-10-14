// src/routes/roleRoutes.ts
import { Router } from 'express';
import { roleController } from '../controllers/roleController';
import { authenticate } from '../middlewares/authMiddleware';

const roleRouter = Router();

// Public route
roleRouter.get('/', roleController.getAllRoles);
roleRouter.get('/:id', roleController.getRoleById);

// Protected routes (require auth)
roleRouter.post('/', authenticate, roleController.createRole);
roleRouter.put('/:id', authenticate, roleController.updateRole);
roleRouter.delete('/:id', authenticate, roleController.deleteRole);

export default roleRouter;
