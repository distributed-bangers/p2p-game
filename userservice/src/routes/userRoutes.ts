import { Router } from 'express'
import { getOneUser, login, signUp } from '../controllers/userController.js'
import { authenticateJWT } from '../auth.js'

const router = Router()

router.route('/').post(signUp)
router.route('/login').post(login)
router.use(authenticateJWT)
router.route('/id/').get(getOneUser)
export default router
