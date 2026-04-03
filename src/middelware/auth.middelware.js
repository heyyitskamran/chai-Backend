import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError("Unauthorize request")
        }
        const decodedTokens = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedTokens?._id).select("-password -refresToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.use = user;
        next()
    } catch (error) {
        throw new ApiError(402, error?.message || "Invalid Access token")
    }
})