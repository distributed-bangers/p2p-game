import { Router } from 'express'
import {
    postGames,
    getGames,
    putGameJoin,
    deleteGame,
    putGameLeave,
    putGameStart,
    putGameLose,
} from '../controllers/gameController.js'
import { authenticateJWT } from '../auth.js'

const router = Router()

router.use(authenticateJWT)
router.route('/').get(getGames).post(postGames)
router.route('/:id').delete(deleteGame)
router.route('/:id/join').put(putGameJoin)
router.route('/:id/leave').put(putGameLeave)
router.route('/:id/start').put(putGameStart)
router.route('/:id/lose').put(putGameLose)

export default router
