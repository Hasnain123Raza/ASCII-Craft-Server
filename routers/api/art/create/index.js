import express from "express";
import artSchema from "./artSchema.js";
import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import mongodb from "mongodb";

import authenticatedMiddleware from "../../../../middlewares/authenticated.js";
import validateMiddleware from "../../../../middlewares/validate.js";

const router = express.Router();

router.use(authenticatedMiddleware);

router.post("/", validateMiddleware(artSchema), async (request, response) => {
  const data = request.body;

  try {
    const userId = new mongodb.ObjectId(request.user._id);

    const model = new artModel({
      ...data,
      creatorId: userId,
    });

    const currentDate = Date.now();
    const { artCreateCooldown } = request.user;

    if (artCreateCooldown < currentDate) {
      const savedResponse = await model.save();

      await userModel.updateOne(
        { _id: userId },
        {
          $push: { artIds: savedResponse._id },
          $set: { artCreateCooldown: currentDate + 60 * 1000 },
        },
        {}
      );

      response.status(200).json({ success: true, payload: savedResponse });
    } else {
      response.status(500).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ success: false });
  }
});

export default router;
