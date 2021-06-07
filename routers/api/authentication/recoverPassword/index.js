import express from "express";
import userModel from "../../../../services/database/models/user.js";
import sendMail from "../../../../services/mail/index.js";
import { v4 as uuidv4 } from "uuid";
import recoverPasswordFormSchema from "./recoverPasswordFormSchema.js";

import validateMiddleware from "../../../../middlewares/validate.js";

const router = express.Router();

router.post(
  "/",
  validateMiddleware(recoverPasswordFormSchema),
  async (request, response) => {
    const { email } = request.body;

    const userAggregateForPasswordRecoveryCooldown = await userModel
      .aggregate([
        { $match: { email } },
        { $project: { passwordRecoveryCooldown: 1 } },
      ])
      .exec();

    const { _id, passwordRecoveryCooldown } =
      userAggregateForPasswordRecoveryCooldown[0];

    if (
      Boolean(passwordRecoveryCooldown) &&
      passwordRecoveryCooldown > Date.now()
    )
      return response.status(500).json({
        success: false,
        errors: [
          {
            path: ["alert"],
            message:
              "You need to wait a moment before another email can be sent.",
          },
        ],
      });

    try {
      const passwordRecoveryToken = uuidv4();

      sendMail(
        email,
        "Email Verification",
        `
        <html>
          <body>
            Hello! <br/> <br/>
            
            You have requested to recover your password on <b>ASCII-Craft</b> website using this email. <br/>
            To complete this process please go to this link: <a href="${`${
              "https://" + request.get("Host")
            }/authentication/newpassword/${_id.toString()}/${passwordRecoveryToken}`}">verify</a> <br/> <br/>
            
            Please do not reply to this email as it is send through an automated bot. <br/>
            To contact us, please visit this link: <a href="#">contact</a>
          </body>
        </html>
        `
      );

      await userModel.updateOne(
        { _id },
        {
          $set: {
            passwordRecoveryCooldown: Date.now() + 60 * 1000,
            passwordRecoveryTimeout: Date.now() + 15 * 60 * 1000,
            passwordRecoveryToken,
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
