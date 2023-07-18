import { Router } from 'express';
import { getGames } from '../controllers/gameController.js';
// import { authenticateJWT } from '../auth';

const router = Router();

router.route('/').get(getGames);

export default router;
