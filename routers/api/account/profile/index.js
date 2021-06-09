import express from "express";
import userModel from "../../../../services/database/models/user.js";
import artModel from "../../../../services/database/models/art.js";
import mongodb from "mongodb";

const router = express.Router();

router.get("/:userId", async (request, response) => {
  try {
    const userId = new mongodb.ObjectId(request.params.userId);

    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: userId } },
        {
          $project: {
            username: "$username",
            createdArtIds: { $reverseArray: "$createdArtIds" },
            likedArtIds: { $reverseArray: "$likedArtIds" },
            totalArtsCreated: { $size: "$createdArtIds" },
            totalArtsLiked: { $size: "$likedArtIds" },
          },
        },
        {
          $unwind: { path: "$createdArtIds", preserveNullAndEmptyArrays: true },
        },
        { $limit: 3 },
        {
          $group: {
            _id: "$_id",
            username: { $first: "$username" },
            createdArtIds: { $push: "$createdArtIds" },
            likedArtIds: { $first: "$likedArtIds" },
            totalArtsCreated: { $first: "$totalArtsCreated" },
            totalArtsLiked: { $first: "$totalArtsLiked" },
          },
        },
        { $unwind: { path: "$likedArtIds", preserveNullAndEmptyArrays: true } },
        { $limit: 3 },
        {
          $group: {
            _id: "$_id",
            username: { $first: "$username" },
            createdArtIds: { $first: "$createdArtIds" },
            likedArtIds: { $push: "$likedArtIds" },
            totalArtsCreated: { $first: "$totalArtsCreated" },
            totalArtsLiked: { $first: "$totalArtsLiked" },
          },
        },
      ])
      .exec();

    if (!Boolean(userAggregate[0]))
      return response.status(400).json({ success: false });

    const {
      username,
      createdArtIds,
      likedArtIds,
      totalArtsCreated,
      totalArtsLiked,
    } = userAggregate[0];

    const createdArts = await artModel
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
          },
        },
        { $match: { _id: { $in: createdArtIds } } },
      ])
      .exec();

    const likedArts = await artModel
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
          },
        },
        { $match: { _id: { $in: likedArtIds } } },
      ])
      .exec();

    return response.status(200).json({
      success: true,
      payload: {
        username,
        createdArts,
        likedArts,
        totalArtsCreated,
        totalArtsLiked,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

export default router;
