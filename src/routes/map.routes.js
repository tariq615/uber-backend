import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
  getCoordinates,
  getDistanceTime,
  getAutoCompleteSuggestion
} from "../controllers/map.controller.js";
import { query } from "express-validator";

const router = Router();

router
  .route("/get-coordinates")
  .get(
    query("address").isString().isLength({ min: 3 }),
    authUser,
    getCoordinates
  );

router
  .route("/get-distance-time")
  .get(
    query("origin").isString().isLength({ min: 3 }),
    query("destination").isString().isLength({ min: 3 }),
    authUser,
    getDistanceTime
  );

  router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authUser,
    getAutoCompleteSuggestion
) 
export default router;
