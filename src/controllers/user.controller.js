import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    //User detail
    //validation - not empty
    //already exist or not:
    //check for images , check for avatar 
    //upload them in cloudinary
    //create user object - create entry in db
    //remove password and refreshtoken field from response
    //check for user creation
    //return respoonse

    const {fullname, username, password, email } = req.body
    console.log('email', email)
})

export {registerUser}