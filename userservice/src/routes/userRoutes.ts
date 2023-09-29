import { Router } from 'express'
import {
    getOneUser,
    login,
    logoutUser,
    signUp,
} from '../controllers/userController.js'
import { authenticateJWT } from '../middleware/auth.js'

/**
 * router initialised and endpoints added into it
 */
const router = Router()
router.route('/').post(signUp)
router.route('/login').post(login)

router.use(authenticateJWT)

router.route('/id').get(getOneUser)
router.route('/logout').post(logoutUser)
export default router
