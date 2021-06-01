import express from "express";
import passport from "passport";
import loginFormSchema from "./loginFormSchema.js";

import validateMiddleware from "../../../../middlewares/validate.js";
import reCaptchaV2Middleware from "../../../../middlewares/reCaptchaV2.js";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(loginFormSchema),
  reCaptchaV2Middleware,
  (request, response, next) => {
    if (Boolean(request.user))
      response.status(400).json({
        success: false,
        error: { authenticated: true },
      });

    const { username, password } = request.body.user;
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
        } else return response.status(200).json({ success: true });
      });
    })(request, response, next);
  }
);

export default router;
