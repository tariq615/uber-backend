import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.model.js";

export const createUser = async ({ firstname, lastname, email, password }) => {
  
    if (!firstname || !email || !password) {
      throw new ApiError(400, "all fields are required");
    }

    const user = await userModel.create({
      fullname: {
        firstname,
        lastname,
      },
      email,
      password,
    });

    return user;
  }
