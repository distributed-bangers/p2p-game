import { Router } from 'express'
import {
    postGames,
    getGames,
    putGameJoin,
    deleteGame,
    putGameLeave,
    postGameStart,
    postGameFinish,
} from '../controllers/gameController.js'
import { authenticateJWT } from '../auth.js'

const router = Router()

router.use(authenticateJWT)
router.route('/').get(getGames).post(postGames)
router.route('/:id').delete(deleteGame)
router.route('/:id/join').put(putGameJoin)
router.route('/:id/leave').put(putGameLeave)
router.route('/:id/start').put(postGameStart)
router.route('/:id/finish').put(postGameFinish)

export default router
