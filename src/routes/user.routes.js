import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middelware/multer.middelware.js";
import { verifyJWT } from "../middelware/auth.middelware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
)

router.route("login").post(loginUser)

//secured route
router.route("logout").post(verifyJWT, logoutUser)

export default router;
