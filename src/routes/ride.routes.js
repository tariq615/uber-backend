import { Router } from "express";
import { authUser, authCaptain } from "../middlewares/auth.middleware.js";
import { body, query } from "express-validator";
import {createRide, getFares, confirmRide, startRide, cancelRide, completeRide} from "../controllers/ride.controller.js"

const router = Router()

router.route("/createRide").post(
    authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'moto' ]).withMessage('Invalid vehicle type'),
    createRide
)

router.route("/get-fare").get(
    authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    getFares
)

router.route("/confirm-ride").post(
    authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    confirmRide
)

router.route("/start-ride").get(
    authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    startRide
)

router.route("/cancel-ride").get(
    authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    cancelRide
)

router.route("/complete-ride").get(
    authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    completeRide
)
export default router