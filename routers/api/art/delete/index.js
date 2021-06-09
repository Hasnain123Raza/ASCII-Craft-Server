import express from "express";
import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import mongodb from "mongodb";

import authenticatedMiddleware from "../../../../middlewares/authenticated.js";

const router = express.Router();

router.get("/:artId", authenticatedMiddleware, async (request, response) => {
  const { artId } = request.params;
  const userId = request.user._id;

  try {
    const art = await artModel.findById(artId).exec();

    if (!Boolean(art)) return response.status(400).json({ success: false });
    if (art.creatorId.toString() !== userId.toString())
      return response.status(403).json({ success: false });

    await artModel.deleteOne({ _id: artId });
    await userModel.updateOne(
      { _id: userId },
      { $pull: { createdArtIds: artId } },
      {}
    );
    await userModel.updateMany(
      {},
      { $pull: { likedArtIds: artId } },
      { multi: true }
    );

    return response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

export default router;
