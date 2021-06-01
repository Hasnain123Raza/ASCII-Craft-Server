import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import userModel from "../database/models/user.js";
import userSchema from "../../routers/api/authentication/userSchema.js";
import bcrypt from "bcrypt";

const verifyCallback = async (username, password, done) => {
  try {
    const user = await userModel
      .findOne({ username })
      .collation({ locale: "en", strength: 1 })
      .exec();

    if (!Boolean(user)) {
      return done(null, false, {
        message: "Username is invalid.",
        path: ["user", "username"],
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

const strategy = new LocalStrategy(verifyCallback);

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
        permission: user.permission,
        artCreateCooldown: user.artCreateCooldown,
      });
    else return done(null, false);
  } catch (error) {
    console.log(error);
    return done(null);
  }
});
