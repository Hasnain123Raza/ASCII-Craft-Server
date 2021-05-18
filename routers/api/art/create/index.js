import express from "express";
import artSchema from "./artSchema.js";
import artModel from "../../../../services/database/models/art.js";

const router = express.Router();

router.post("/", async (request, response) => {
  const data = request.body;

  const validationResult = artSchema.validate(data);
  if (validationResult.error) {
    const { message, path } = validationResult.error.details[0];
    response.status(400).json({ success: false, error: { message, path } });
  } else {
    try {
      const model = new artModel({ ...data });
      const savedResponse = await model.save();
      response.status(200).json({ success: true, payload: savedResponse });
    } catch (error) {
      console.log(error);
      response.status(500).json({ success: false, error });
    }
  }
});

export default router;
