import { Router } from "express";
import { body, query} from "express-validator";
import { registerCaptain, loginCaptain, getCaptain, logoutCaptain } from "../controllers/captain.controller.js";
import { authCaptain } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post([
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isIn([ 'car', 'moto', 'auto' ]).withMessage('Invalid vehicle type')
], registerCaptain);

router.route("/login").post([
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], loginCaptain);

router.route("/get-profile").get(authCaptain, getCaptain);

router.route("/logout").get(authCaptain, logoutCaptain)

export default router;