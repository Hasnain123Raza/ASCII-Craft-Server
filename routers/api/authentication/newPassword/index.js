import express from "express";
import userModel from "../../../../services/database/models/user.js";
import newPasswordFormSchema from "./newPasswordFormSchema.js";
import mongodb from "mongodb";
import bcrypt from "bcrypt";

import validateMiddleware from "../../../../middlewares/validate.js";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(newPasswordFormSchema),
  async (request, response) => {
    const { _id, token, password } = request.body;

    try {
      const userAggregate = await userModel
        .aggregate([
          { $match: { _id: new mongodb.ObjectId(_id) } },
          {
            $project: {
              passwordRecoveryToken: 1,
              passwordRecoveryTimeout: 1,
            },
          },
        ])
        .exec();

      const { passwordRecoveryToken, passwordRecoveryTimeout } =
        userAggregate[0];

      if (!Boolean(passwordRecoveryToken))
        return response.status(400).json({
          success: false,
          errors: [
            {
              path: ["alert"],
              message: "This token has expired. Please request a new one.",
            },
          ],
        });

      if (Date.now() > passwordRecoveryTimeout)
        return response.status(400).json({
          success: false,
          errors: [
            {
              path: ["alert"],
              message: "This token has expired. Please request a new one.",
            },
          ],
        });

      if (token !== passwordRecoveryToken)
        return response.status(400).json({
          success: false,
          errors: [
            {
              path: ["alert"],
              message: "This token has expired. Please request a new one.",
            },
          ],
        });

      const hashedPassword = await bcrypt.hash(password, 10);

      await userModel.updateOne(
        { _id: new mongodb.ObjectId(_id) },
        {
          $set: { password: hashedPassword },
          $unset: {
            passwordRecoveryToken: "",
            passwordRecoveryTimeout: "",
            passwordRecoveryCooldown: "",
          },
        },
        {}
      );

      return response.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

export default router;
