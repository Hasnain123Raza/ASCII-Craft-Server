import express from "express";
import passport from "passport";
import userModel from "../../../../services/database/models/user.js";
import registerFormSchema from "./registerFormSchema.js";
import bcrypt from "bcrypt";

import validateMiddleware from "../../../../middlewares/validate.js";
import reCaptchaV2Middleware from "../../../../middlewares/reCaptchaV2.js";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(registerFormSchema),
  reCaptchaV2Middleware,
  async (request, response, next) => {
    if (Boolean(request.user))
      response.status(400).json({
        success: false,
        error: { authenticated: true },
      });

    const { user } = request.body;

    try {
      const { username, email, password } = user;

      const duplicate = await userModel
        .findOne({ $or: [{ username }, { email: email.toLowerCase() }] })
        .collation({ locale: "en", strength: 1 });

      if (duplicate) {
        if (duplicate.email === email)
          return response.status(400).json({
            success: false,
            error: {
              message: "Email has already been used.",
              path: ["user", "email"],
            },
          });
        else
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
        email: email.toLowerCase(),
        password: hashedPassword,
      });
      const savedResponse = await model.save();

      request.body = { username, password };
      passport.authenticate("local", (error, user, info) => {
        if (error) {
          console.log(error);
          return response.status(500).json({ success: false });
        }
        if (!user)
          return response.status(500).json({ success: false, error: info });

        request.logIn(user, (error) => {
          if (error) {
            console.log(error);
            return response.status(500).json({ success: false });
          } else
            return response.status(200).json({
              success: true,
              payload: {
                _id: savedResponse._id,
                username: savedResponse.username,
                email: savedResponse.email,
                rank: savedResponse.rank,
              },
            });
        });
      })(request, response, next);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

export default router;
