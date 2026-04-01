import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
    //User detail
    //validation - not empty
    //already exist or not: username , email
    //check for images , check for avatar 
    //upload them in cloudinary
    //create user object - create entry in db
    //remove password and refreshtoken field from response
    //check for user creation
    //return respoonse

    const {fullname, username, password, email } = req.body
    // console.log('email', email)
    // console.log("password", password)
    // console.log("fullname", fullname)
    // console.log("username", username)
    // console.log(req.body)

    if (
        [fullname, username, password, email].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, " All fields are required ")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    console.log(existedUser)

    if (existedUser){
        throw new ApiError(409, "User already existed")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // let avatarLocalPath;
    // if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    //     avatarLocalPath = req.files.avatar[0].path
    // }

    if(!avatarLocalPath){
        throw new ApiError(400, " Avatar is required ")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create(
        {
            fullname,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        }
    )
    const createdUser = await User.findById(user._id).select(" -password -refresToken")

    if (!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, " User register successfully ")
    )
})

export {registerUser}