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
            artIds: { $reverseArray: "$artIds" },
            totalArtsCreated: { $size: "$artIds" },
          },
        },
        { $unwind: { path: "$artIds", preserveNullAndEmptyArrays: true } },
        { $limit: 3 },
        {
          $group: {
            _id: "$_id",
            username: { $first: "$username" },
            totalArtsCreated: { $first: "$totalArtsCreated" },
            artIds: { $push: "$artIds" },
          },
        },
      ])
      .exec();

    if (!Boolean(userAggregate))
      return response.status(400).json({ success: false });

    const artAggregate = await artModel
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
          },
        },
        { $match: { _id: { $in: userAggregate[0].artIds } } },
      ])
      .exec();

    const result = {
      _id: userAggregate[0]._id,
      username: userAggregate[0].username,
      totalArtsCreated: userAggregate[0].totalArtsCreated,
      recentSimplifiedArts: artAggregate,
    };

    return response.status(200).json({ success: true, payload: result });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

export default router;
