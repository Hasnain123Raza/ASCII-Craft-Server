import express from "express";
import artSchema from "./artSchema.js";
import artModel from "../../../../services/database/models/art.js";
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
      const model = new artModel({
        ...data,
        creatorId: new mongodb.ObjectID(request.user._id),
      });
      const savedResponse = await model.save();
      response.status(200).json({ success: true, payload: savedResponse });
    } catch (error) {
      console.log(error);
      response.status(500).json({ success: false });
    }
  }
});

export default router;
