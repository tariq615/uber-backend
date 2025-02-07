import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { captainModel } from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from "express-validator";
import { blacklistModel } from "../models/blacklistToken.model.js";

const registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  const isCaptainAlreadyExist = await captainModel.findOne({ email });

  if (isCaptainAlreadyExist) {
    throw new ApiError(400, "user already exists");
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  if (!captain) {
    throw new ApiError(500, "tryagain later");
  }
  const token = await captain.generateAuthToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        201,
        { captain, token },
        "captain registered successfully"
      )
    );
});

const loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel
    .findOne({
      email,
    })
    .select("+password");

  if (!captain) {
    throw new ApiError(401, "Inavlid email or password");
  }

  const isPasswordValid = await captain.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Inavlid email or password");
  }

  const token = captain.generateAuthToken();

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, { captain, token }, "loggedin successfully"));
});

const getCaptain = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.captain, "user fetched successfully"));
});

const logoutCaptain = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.replace("Bearer ", "")
      : undefined);

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  await blacklistModel.create({
    token,
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "logged out successfully"));
});

export { registerCaptain, loginCaptain, getCaptain, logoutCaptain };
