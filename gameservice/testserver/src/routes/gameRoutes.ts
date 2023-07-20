import { Router } from 'express';
import { postGames, getGames } from '../controllers/gameController.js';
import { checkBodyPostGame } from '../services/gameService.js';

// import { authenticateJWT } from '../auth';

const router = Router();

router.route('/').get(getGames).post(postGames);
// router.route('/:id').delete(deleteGame);
// router.route('/:id/join').put(checkBodyJoinLeaveGame, joinGame);
// router.route('/:id/leave').put(checkBodyJoinLeaveGame, leaveGame);
// router.route('/:id/start').post(startGame);

export default router;
