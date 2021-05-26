import express from "express";
import artModel from "../../../../services/database/models/art.js";

const router = express.Router();

router.get("/art/:artId", async (request, response) => {
  const { artId } = request.params;

  try {
    const art = await artModel.findById(artId);
    if (Boolean(art)) {
      response.status(200).json({ success: true, payload: art });
    } else {
      response.status(404).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ success: false });
  }
});

export default router;
