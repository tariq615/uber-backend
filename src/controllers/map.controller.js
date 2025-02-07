import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import { getAddressCoordinates } from "../services/map.service.js";
import { getDistanceAndTime } from "../services/map.service.js";
import { getAutoCompleteSuggestions } from "../services/map.service.js";
import { formatTime } from "../utils/formatDuration.js";


const getCoordinates = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;

  try {
    const coordinates = await getAddressCoordinates(address);
    console.log(coordinates);

    return res
      .status(200)
      .json(
        new ApiResponse(200, coordinates, "Coordinates fetched successfully")
      );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  }
});

const getDistanceTime = asyncHandler(async (req, res) => {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array(), message: "Validation failed" });
  }

  try {
    const { origin, destination } = req.query;

    // Fetch distance and time
    const distanceTime = await getDistanceAndTime(origin, destination);
    const { distance, duration } = distanceTime;

    // Convert distance to kilometers and duration to formatted string
    const distanceInKm = (distance / 1000).toFixed(2);
    const totalDuration = formatTime(duration);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { distanceInKm, totalDuration },
          "Distance and time fetched successfully"
        )
      );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  }
});

const getAutoCompleteSuggestion = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { input } = req.query;

    const suggestions = await getAutoCompleteSuggestions(input);
    return res
      .status(200)
      .json(
        new ApiResponse(200, suggestions, "suggestions fetched successfully")
      );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  }
});
export { getCoordinates, getDistanceTime, getAutoCompleteSuggestion };
