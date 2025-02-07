import { rideModel } from "../models/ride.model.js";
import { getFare } from "../config/fareConfig.js";
import { ApiError } from "../utils/ApiError.js";
import { getOtp } from "../utils/otp.js";
import mongoose from "mongoose";

// Service function to create a ride
export const createRideSer = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new ApiError(
      400,
      "All fields (user, pickup, destination, vehicle type) are required to create a ride."
    );
  }

    // getting fare & time
    const { fare, distanceTime } = await getFare(pickup, destination);

    // Create ride in the database
    const ride = await rideModel.create({
      user,
      pickup,
      destination,
      fare: fare[vehicleType],
      duration: distanceTime.duration,
      distance: distanceTime.distance,
      otp: getOtp(6),
    });

    if (!ride) {
      throw new ApiError(
        500,
        "Ride creation failed due to an unexpected database error."
      );
    }

    return ride;
};

export const confirmRideSer = async ({ rideId, captainId }) => {
  if (!rideId || !captainId) {
    throw new ApiError(400, "rideId and captainId is required");
  }

    const rideStatus = await rideModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(rideId), status: "pending" }, // Match the document
      { 
        $set: {
          status: "accepted",
          captain: captainId,
        }
      }, // Update values
      { new: true } // Return the updated document
    )
      .populate("user") // Populate user field
      .populate("captain") // Populate captain field
      .select("+otp"); // Optional: Include additional fields like otp if needed
    
      if (!rideStatus) {
        throw new ApiError(
          400,
          "Ride has already been accepted by another captain."
        );
      }

    return rideStatus;
};

export const startRideSer = async ({ rideId, otp, captainId }) => {

  if (!rideId || !otp || !captainId) {
    throw new ApiError(400, "rideId, otp and captainId is required");
  }

    const ride = await rideModel.findOne({
      _id: rideId,
      otp: otp,
      status: "accepted",
      captain: captainId,
    }).populate("user").populate("captain");

    if (!ride) {
      throw new ApiError(400, "Invalid ride id or otp");
    }

    ride.status = "ongoing";
    await ride.save();

    return ride;
};

export const cancelRideSer = async ({ rideId, captainId }) => {

  if (!rideId || !captainId) {
    throw new ApiError(400, "rideId and captainId is required");
  }

    const ride = await rideModel.findOne({
      _id: rideId,
      status: "accepted",
      captain: captainId,
    }).populate("user").populate("captain");

    if (!ride) {
      throw new ApiError(400, "Invalid ride id or otp");
    }

    ride.status = "cancelled";
    await ride.save();

    return ride;
  };

export const completeRideSer = async ({ rideId, captainId }) => {

  if (!rideId || !captainId) {
    throw new ApiError(400, "rideId and captainId is required");
  }

    const ride = await rideModel.findOne({
      _id: rideId,
      status: "ongoing",
      captain: captainId,
    }).populate("user").populate("captain");

    if (!ride) {
      throw new ApiError(400, "Invalid ride id or otp");
    }

    ride.status = "completed";
    await ride.save();

    return ride;
};