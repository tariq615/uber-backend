import { Router } from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    [
      body("email").isEmail().withMessage("Invalid Email"),
      body("fullname.firstname")
        .isLength({ min: 3 })
        .withMessage("First Name must be atleast three characters long"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be atleast six characters long"),
    ],
    registerUser
  );

router
  .route("/login")
  .post(
    [
      body("email").isEmail().withMessage("Invalid Email"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be atleast six characters long"),
    ],
    loginUser
  );

router.route("/get-profile").get(authUser, getUser);

router.route("/logout").get(authUser, logoutUser)
export default router;
