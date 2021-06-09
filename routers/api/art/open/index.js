import express from "express";
import userModel from "../../../../services/database/models/user.js";
import artModel from "../../../../services/database/models/art.js";
import mongodb from "mongodb";

import authenticatedMiddleware from "../../../../middlewares/authenticated.js";

const router = express.Router();

async function hasUserLikedArt(userId, artId) {
  return Boolean(
    await userModel
      .findOne({ _id: userId, likedArtIds: artId }, { _id: 1 })
      .exec()
  );
}

router.get("/:artId", async (request, response) => {
  const { artId } = request.params;

  try {
    const art = await artModel.findById(artId);
    if (Boolean(art)) {
      if (Boolean(request.user)) {
        const hasLiked = await hasUserLikedArt(
          request.user._id,
          mongodb.ObjectId(artId)
        );

        art.hasLiked = true;

        return response
          .status(200)
          .json({ success: true, payload: { art, hasLiked } });
      } else {
        return response
          .status(200)
          .json({ success: true, payload: { art, hasLiked: null } });
      }
    } else {
      return response.status(404).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

router.get(
  "/like/:artId",
  authenticatedMiddleware,
  async (request, response) => {
    const { artId } = request.params;

    try {
      const hasLiked = await hasUserLikedArt(
        request.user._id,
        mongodb.ObjectId(artId)
      );

      if (hasLiked) return response.status(200).json({ success: true });

      await artModel
        .updateOne({ _id: mongodb.ObjectId(artId) }, { $inc: { likes: 1 } }, {})
        .exec();

      await userModel
        .updateOne(
          { _id: request.user._id },
          { $push: { likedArtIds: mongodb.ObjectId(artId) } },
          {}
        )
        .exec();

      return response.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

router.get(
  "/unlike/:artId",
  authenticatedMiddleware,
  async (request, response) => {
    const { artId } = request.params;

    try {
      const hasLiked = await hasUserLikedArt(
        request.user._id,
        mongodb.ObjectId(artId)
      );

      if (!hasLiked) return response.status(200).json({ success: true });

      await artModel
        .updateOne(
          { _id: mongodb.ObjectId(artId) },
          { $inc: { likes: -1 } },
          {}
        )
        .exec();

      await userModel
        .updateOne(
          { _id: request.user._id },
          { $pull: { likedArtIds: mongodb.ObjectId(artId) } },
          {}
        )
        .exec();

      return response.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

export default router;
