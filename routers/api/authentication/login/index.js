import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/", (request, response, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
    if (!user)
      return response.status(200).json({ success: false, error: info });

    request.logIn(user, (error) => {
      if (error) {
        console.log(error);
        return response.status(500).json({ success: false });
      } else return response.status(200).json({ success: true });
    });
  })(request, response, next);
});

export default router;
