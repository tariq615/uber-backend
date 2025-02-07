import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { blacklistModel } from "../models/blacklistToken.model.js";
import { captainModel } from "../models/captain.model.js";


export const authUser = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.replace("Bearer ", "")
        : undefined);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    const blacklist = await blacklistModel.findOne({
      token: token
    });

    if (blacklist) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
    const user = await userModel.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});


export const authCaptain = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.replace("Bearer ", "")
        : undefined);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    const blacklist = await blacklistModel.findOne({
      token: token
    });

    if (blacklist) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
    const captain = await captainModel.findById(decodedToken?._id);

    if (!captain) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.captain = captain;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});