import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createRideSer, confirmRideSer, startRideSer, cancelRideSer, completeRideSer } from "../services/ride.service.js";
import { validationResult } from "express-validator";
import { getFare } from "../config/fareConfig.js";
import {
  getAddressCoordinates,
  getCaptainsInTheRadius,
} from "../services/map.service.js";
import { sendMessageToSocketId } from "../socket.js";
import { rideModel } from "../models/ride.model.js";


const createRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

    const ride = await createRideSer({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    res
      .status(201)
      .json(new ApiResponse(201, ride, "Ride created successfully"));

    const pickupCoordinates = await getAddressCoordinates(pickup);

    // console.log(pickupCoordinates);

    // const captainsInRadius = await getCaptainsInTheRadius( ## for radius within 2 km ranges
    //   pickupCoordinates.lat,
    //   pickupCoordinates.lng,
    //   2
    // );

    const captainsInRadius = await getCaptainsInTheRadius();

    const rideData = await rideModel.aggregate([
      {
        $match: {
          _id: ride._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            fullname: 1,
          },
          pickup: 1,
          destination: 1,
          fare: 1,
          status: 1,
          duration: 1,
          distance: 1,
          paymentID: 1,
          orderId: 1,
          signature: 1,
          otp: 1,
        },
      },
    ]);
    // console.log(rideData);

    captainsInRadius.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideData[0],
      });
    });
});

const getFares = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

    const fare = await getFare(pickup, destination);

    return res
      .status(200)
      .json(new ApiResponse(200, fare, "Fare calculated successfully"));
});

const confirmRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  // try {
    const ride = await confirmRideSer({ rideId, captainId: req.captain._id });
    // console.log(ride);

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    res.status(200).json(new ApiResponse(200, ride, "Ride confirmed"));

});

const startRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

    const ride = await startRideSer({ rideId, otp, captainId: req.captain._id });
    
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    res.status(200).json(new ApiResponse(200, ride, "Ride started"));

});

const cancelRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

    const ride = await cancelRideSer({ rideId, captainId: req.captain._id });
    
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-cancelled",
      data: ride,
    });

    res.status(200).json(new ApiResponse(200, ride, "Ride cancelled"));

});

const completeRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

    const ride = await completeRideSer({ rideId, captainId: req.captain._id });
    
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-completed",
      data: ride,
    });

    res.status(200).json(new ApiResponse(200, ride, "Ride completed"));
});
export { createRide, getFares, confirmRide, startRide, cancelRide, completeRide };
