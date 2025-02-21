import { getDistanceAndTime } from "../services/map.service.js";

const BASE_FARE = {
  auto: 70,
  car: 90,
  moto: 55,
};

const PER_KM_RATE = {
  auto: 22,
  car: 27,
  moto: 15,
};

const PER_MINUTE_RATE = {
  auto: 10,
  car: 15,
  moto: 7,
};

export async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new ApiError(
      400,
      "Pickup and destination locations are required to calculate the fare."
    );
  }

  const distanceTime = await getDistanceAndTime(pickup, destination);

  if (!distanceTime) {
    throw new ApiError(
      502,
      "Failed to fetch distance and travel time from the map service."
    );
  }

  const fare = {
    auto: Math.round(
      BASE_FARE.auto +
        (distanceTime.distance / 1000) * PER_KM_RATE.auto +
        (distanceTime.duration / 60) * PER_MINUTE_RATE.auto
    ),
    car: Math.round(
      BASE_FARE.car +
        (distanceTime.distance / 1000) * PER_KM_RATE.car +
        (distanceTime.duration / 60) * PER_MINUTE_RATE.car
    ),
    moto: Math.round(
      BASE_FARE.moto +
        (distanceTime.distance / 1000) * PER_KM_RATE.moto +
        (distanceTime.duration / 60) * PER_MINUTE_RATE.moto
    ),
  };

  return {fare, distanceTime};
}
