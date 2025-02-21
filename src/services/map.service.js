import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { captainModel } from "../models/captain.model.js";

export const getAddressCoordinates = async (address) => {
  const apiKey = process.env.OPENCAGE_API;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    // console.log(response);

    // Check if the results array exists and has at least one result
    if (response.data.results && response.data.results.length > 0) {
      const { lng, lat } = response.data.results[0].geometry;
      return { lng, lat }; // Return the coordinates
    } else {
      // If no results are found, throw a custom 404 error
      throw new ApiError(404, `No results found for the address: "${address}"`);
    }
  } catch (error) {
    console.error("Geocoding error:", error);

    // Re-throw custom errors to avoid overriding them
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle unexpected or system-level errors
    throw new ApiError(
      500,
      "Failed to fetch address coordinates. Please try again."
    );
  }
};

export const getDistanceAndTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new ApiError(400, "Origin and destination are required");
  }

  try {
    // Fetch coordinates for origin and destination
    const originResponse = await getAddressCoordinates(origin);
    const destinationResponse = await getAddressCoordinates(destination);

    // Construct coordinates for Mapbox API
    const originCoords = `${originResponse.lng},${originResponse.lat}`;
    const destinationCoords = `${destinationResponse.lng},${destinationResponse.lat}`;
    console.log(originCoords, "log", destinationCoords);

    const accessToken = process.env.MAPBOX_TOKEN;

    // Validate if access token is provided
    if (!accessToken) {
      throw new ApiError(500, "Mapbox access token is not configured");
    }

    // Call Mapbox API for distance and time
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(
      originCoords
    )};${encodeURIComponent(destinationCoords)}?steps=true&access_token=${accessToken}`;

    const response = await axios.get(url);

    // Check if route data is available
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const { distance, duration } = route;

      return { distance, duration };
    } else {
      throw new ApiError(
        404,
        "No routes found for the given origin and destination"
      );
    }
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      throw error; // Rethrow ApiError to be handled at the controller level
    }

    // Handle unexpected errors
    throw new ApiError(
      500,
      "An unexpected error occurred while calculating distance and time",
      error
    );
  }
};

export const getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new ApiError(400, "Input query is required");
  }

  const apiKey = process.env.OPENCAGE_API;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    input
  )}&key=${apiKey}&countrycode=pk`;

  try {
    const response = await axios.get(url);

    if (response.data.results && response.data.results.length > 0) {
      // OpenCage returns results in `results` array
      const suggestions = response.data.results.map((result) => ({
        place_name: result.formatted,
        coordinates: {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
        },
      }));
      return suggestions;
    } else {
      throw new ApiError(404, "No suggestions found");
    }
  } catch (error) {
    console.error("OpenCage Suggestions Error:", error);
    // Re-throw custom errors to avoid overriding them
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle unexpected or system-level errors
    throw new ApiError(
      500,
      "Failed to fetch address coordinates. Please try again."
    );
  }
};

// export const getCaptainsInTheRadius = async (ltd, lng, radius) => { // for within 2 km range
//   try {
//     const captains = await captainModel.find({
//       location: {
//         $geoWithin: {
//           $centerSphere: [[lng, ltd], radius / 6371], // radius in radians
//         },
//       },
//     }); // Fetch only necessary fields

//     return captains;
//   } catch (error) {
//     console.error('Error fetching captains in the radius:', error);
//     throw new ApiError(500, 'Could not fetch captains in the radius', error);
//   }
// };

export const getCaptainsInTheRadius = async () => {
  try {
    const captains = await captainModel.find(); // Fetch all captains
    return captains;
  } catch (error) {
    console.error("Error fetching captains:", error);
    throw new ApiError(500, 'Could not fetch captains in the radius', error);
  }
};
