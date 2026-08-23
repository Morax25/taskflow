import Router from 'express'
import { validate } from '../../middleware/validator.middleware.js';
import { registerUserSchema, userLoginSchema } from './auth.validation.js';
import { userLogin, userRegister } from './auth.controller.js';

const router = Router()

router.post('/register', validate(registerUserSchema), userRegister)
router.post('/login', validate(userLoginSchema), userLogin)

export default router