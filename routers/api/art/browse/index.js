import express from "express";
import artModel from "../../../../services/database/models/art.js";

const router = express.Router();

router.get("/artCount", async (request, response) => {
  try {
    const count = await artModel.find().estimatedDocumentCount();
    response.status(200).json({ success: true, count });
  } catch (error) {
    response.status(500).json({ success: false, error });
  }
});

router.get("/simplifiedArt/:pageIndex/:pageSize", async (request, response) => {
  const params = request.params;
  const pageIndex = parseInt(params.pageIndex);
  const pageSize = parseInt(params.pageSize);

  if (
    isNaN(pageIndex) ||
    isNaN(pageSize) ||
    pageIndex < 0 ||
    pageSize < 1 ||
    pageSize > 12
  ) {
    return response.status(400).json({ success: false });
  } else {
    try {
      const arts = await artModel
        .find({})
        .skip(pageIndex * pageSize)
        .limit(pageSize);
      const simplifiedArts = arts.map(({ _id, title, description }) => ({
        _id,
        title,
        description,
      }));

      response.status(200).json({ success: true, payload: simplifiedArts });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
});

export default router;
