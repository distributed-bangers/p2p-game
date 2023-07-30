import { Router } from 'express';
import { getOneUser, login, signIn } from '../controllers/userController.js';
import { authenticateJWT } from '../auth.js';

const router = Router();

router.route('/').post(signIn).get(login);

router.use(authenticateJWT);
router.route('/id/').get(getOneUser);
export default router;
