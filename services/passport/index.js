import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import userModel from "../database/models/user.js";
import bcrypt from "bcrypt";

const verifyCallback = async (email, password, done) => {
  try {
    const user = await userModel.findOne({ email }).exec();

    if (!Boolean(user)) {
      return done(null, false, {
        message: "Email is invalid.",
        path: ["user", "email"],
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return done(null, false, {
        message: "Password is invalid.",
        path: ["user", "password"],
      });
    }

    done(null, user);
  } catch (error) {
    console.log(error);
    return done(null);
  }
};

const strategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  verifyCallback
);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await userModel.findById(userId);
    if (Boolean(user))
      return done(null, {
        _id: user._id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        artCreateCooldown: user.artCreateCooldown,
        unverifiedEmailCooldown: user.unverifiedEmailCooldown,
      });
    else return done(null, false);
  } catch (error) {
    console.log(error);
    return done(null);
  }
});
