import {Router} from "express";
import {login, signIn} from "../controllers/userController";

const router = Router();

router.route('/').post(signIn).get(login);

export default router;