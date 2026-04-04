import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user)
    const accessToken = user.generateAccessToken();
    // console.log(accessToken)
    const refreshToken = user.generateRefreshToken();
    console.log(refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh token and access token",
    );
  }
};

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

  const { fullname, username, password, email } = req.body;
  // console.log('email', email)
  // console.log("password", password)
  // console.log("fullname", fullname)
  // console.log("username", username)
  // console.log(req.body)

  if (
    [fullname, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, " All fields are required ");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already existed");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // let avatarLocalPath;
  // if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
  //     avatarLocalPath = req.files.avatar[0].path
  // }

  if (!avatarLocalPath) {
    throw new ApiError(400, " Avatar is required ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    " -password -refresToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, " User register successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  // console.log(req.body);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, " User does not exist ");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, " Password Is Invalid ");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiError(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = res.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorize Request");
  }
  // verify the incoming token
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(user._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    //check user refreshtoken and db refreshtoken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "RefreshToken Expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    //generate new refreshTokens and accessTokens
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("newRefreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(user._id);

  //check old password with stored pass in DB
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(200, {}, "Password Changed Succesfully");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(
    200,
    req.user,
    "Current User Fetched Successfully"
  )
})

const upadateAccountDetail = asyncHandler(async (req, res) => {
  const {username, email, fullname} = req.body
  if (!(username || email || fullname)) {
    throw new ApiError(400, "All Field Are Required")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id, 
    {// set recieves objects in it
      $set: {
        fullname,
        email,
        username
      }
    },
    {new: true}

  ).select("-password")

  return res
  .status(200)
  .json(
    200,
    req.user,
    "User Detail Update Successfully"
  )

})

const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File Is Missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error While Uploading Avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    200,
    user,
    "New Avatar Upload Successfully"
    
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image File Is Missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error While Uploading Cover Image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    200,
    user,
    "New Cover Image Upload Successfully"
    
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  upadateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage
};
