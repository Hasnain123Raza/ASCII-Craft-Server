import express from "express";
import artSchema from "./artSchema.js";
import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import authenticatedMiddleware from "../../../../middlewares/authenticated.js";
import mongodb from "mongodb";

const router = express.Router();

router.use(authenticatedMiddleware);

router.post("/", async (request, response) => {
  const data = request.body;

  const validationResult = artSchema.validate(data);
  if (validationResult.error) {
    const { message, path } = validationResult.error.details[0];
    response.status(400).json({ success: false, error: { message, path } });
  } else {
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
  }
});

export default router;
