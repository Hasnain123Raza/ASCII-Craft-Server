import express from "express";
import userModel from "../../../../services/database/models/user.js";
import userSchema from "../userSchema.js";
import bcrypt from "bcrypt";

import validateMiddleware from "../../../../middlewares/validate.js";
import reCaptchaV2Middleware from "../../../../middlewares/reCaptchaV2.js";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(userSchema),
  reCaptchaV2Middleware,
  async (request, response) => {
    const { user } = request.body;

    try {
      const { username, password } = user;

      const duplicate = await userModel
        .findOne({ username })
        .collation({ locale: "en", strength: 1 });

      if (duplicate) {
        return response.status(400).json({
          success: false,
          error: {
            message: "Username is not unique.",
            path: ["user", "username"],
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const model = new userModel({
        username,
        password: hashedPassword,
      });
      const savedResponse = await model.save();

      response.status(200).json({
        success: true,
        payload: {
          _id: savedResponse._id,
          username: savedResponse.username,
          permission: savedResponse.permission,
        },
      });
    } catch (error) {
      console.log(error);
      response.status(500).json({ success: false });
    }
  }
);

export default router;
