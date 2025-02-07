import { ApiError } from "./ApiError.js";

export function handleServiceError(error, defaultMessage = "An unexpected error occurred") {
    // Handle known API errors
    if (error instanceof ApiError) {
        throw error; // Rethrow ApiError to be handled at the controller level
    }
    
    // Handle unexpected errors
    throw new ApiError(500, defaultMessage, error);
}