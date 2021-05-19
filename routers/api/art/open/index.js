import express from "express";
import artModel from "../../../../services/database/models/art.js";

const router = express.Router();

router.get("/art/:artId", async (request, response) => {
  const { artId } = request.params;

  try {
    const art = await artModel.findById(artId);

    response.status(200).json({ success: true, payload: art });
  } catch (error) {
    console.log(error);
    response.status(500).json({ success: false });
  }
});

export default router;
