import express from "express";
import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import mongodb from "mongodb";

const router = express.Router();

router.get("/:artId", async (request, response) => {
  let { artId } = request.params;
  if (!Boolean(artId)) return response.status(400).json({ success: false });

  if (Boolean(request.user)) {
    try {
      artId = new mongodb.ObjectId(artId);
      const userId = new mongodb.ObjectId(request.user._id);

      const art = await artModel.findById(artId).exec();
      if (Boolean(art)) {
        if (art.creatorId.toString() === userId.toString()) {
          await artModel.deleteOne({ _id: artId });

          const result = await userModel.updateOne(
            { _id: userId },
            { $pull: { artIds: artId } },
            {}
          );
          return response.status(200).json({ success: true });
        } else {
          return response.status(403).json({ success: false });
        }
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  } else {
    return response.status(401).json({ success: false });
  }
});

export default router;
