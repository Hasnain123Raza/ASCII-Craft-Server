import express from "express";
import userModel from "../../../../services/database/models/user.js";
import sendMail from "../../../../services/mail/index.js";
import jwt from "jsonwebtoken";
import mongodb from "mongodb";

import authenticatedMiddleware from "../../../../middlewares/authenticated.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/", authenticatedMiddleware, async (request, response) => {
  const { _id, username, email, unverifiedEmailCooldown } = request.user;

  if (!Boolean(unverifiedEmailCooldown) && unverifiedEmailCooldown !== 0)
    return response.status(500).json({ success: false });

  if (unverifiedEmailCooldown > Date.now())
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
    const payload = {
      _id,
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    sendMail(
      email,
      "Email Verification",
      `
      <html>
        <body>
          Hello ${username}! <br/> <br/>
          
          You have registered on our <b>ASCII-Craft</b> website using this email. <br/>
          To verify this email please go to this link: <a href="${`${
            "https://" + request.get("Host")
          }/authentication/emailverification/${token}`}">verify</a> <br/> <br/>
          
          Please do not reply to this email as it is send through an automated bot. <br/>
          To contact us, please visit this link: <a href="#">contact</a>
        </body>
      </html>
      `
    );

    await userModel.updateOne(
      { _id },
      {
        $set: { unverifiedEmailCooldown: Date.now() + 60 * 1000 },
      },
      {}
    );

    return response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

router.get("/:token", async (request, response) => {
  const { token } = request.params;

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: mongodb.ObjectId(_id) } },
        { $project: { rank: "$rank" } },
      ])
      .exec();

    const user = userAggregate[0];
    const rank = user?.rank;

    if (!Boolean(user))
      return response.status(500).json({
        success: false,
        errors: [
          {
            path: ["alert"],
            message: "The token is invalid.",
          },
        ],
      });

    if (rank !== "unverified")
      return response.status(500).json({
        success: false,
        errors: [
          {
            path: ["alert"],
            message: "Your email is already verified.",
          },
        ],
      });

    await userModel.updateOne(
      { _id: mongodb.ObjectId(_id) },
      {
        $set: { rank: "member" },
        $unset: { unverifiedEmailCooldown: "" },
      },
      {}
    );

    return response.status(200).json({ success: true });
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return response.status(500).json({
        success: false,
        errors: [
          {
            path: ["alert"],
            message: "This token has expired. Please use a new token.",
          },
        ],
      });
    if (error.name === "SyntaxError")
      return response.status(500).json({
        success: false,
        errors: [
          {
            path: ["alert"],
            message: "The token is invalid.",
          },
        ],
      });

    console.log(error);
    return response.status(500).json({ success: false });
  }
});

export default router;
