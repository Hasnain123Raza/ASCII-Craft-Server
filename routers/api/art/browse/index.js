import express, { request } from "express";
import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import mongodb from "mongodb";

const router = express.Router();

router.get("/artCount", async (request, response) => {
  try {
    const count = await artModel.find().estimatedDocumentCount();
    response.status(200).json({ success: true, payload: count });
  } catch (error) {
    response.status(500).json({ success: false, error });
  }
});

router.get("/artCount/:userIdInput", async (request, response) => {
  const { userIdInput } = request.params;

  if (!validateUserId(userIdInput))
    return response.status(400).json({ success: false });

  try {
    const userId = new mongodb.ObjectId(userIdInput);

    const result = await userModel
      .aggregate([
        { $match: { _id: userId } },
        { $project: { _id: 1, totalArtsCreated: { $size: "$artIds" } } },
      ])
      .exec();

    response
      .status(200)
      .json({ success: true, payload: result[0].totalArtsCreated });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ success: false });
  }
});

router.get(
  "/simplifiedArts/:pageIndexInput/:pageSizeInput",
  async (request, response) => {
    const { pageIndexInput, pageSizeInput } = request.params;

    const pageIndex = parseInt(pageIndexInput);
    const pageSize = parseInt(pageSizeInput);
    if (!validatePageIndexAndPageSize(pageIndex, pageSize))
      return response.status(400).json({ success: false });

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
);

// DOES NOT VERIFIES WHETHER OR NOT USER EXISTS
router.get(
  "/simplifiedArts/:userIdInput/:pageIndexInput/:pageSizeInput",
  async (request, response) => {
    const { userIdInput, pageIndexInput, pageSizeInput } = request.params;

    const pageIndex = parseInt(pageIndexInput);
    const pageSize = parseInt(pageSizeInput);
    if (!validatePageIndexAndPageSize(pageIndex, pageSize))
      return response.status(400).json({ success: false });

    if (!validateUserId(userIdInput))
      return response.status(400).json({ success: false });

    try {
      const userId = new mongodb.ObjectId(userIdInput);

      const userAggregate = await userModel
        .aggregate([
          { $match: { _id: userId } },
          { $project: { _id: 1, artIds: { $reverseArray: "$artIds" } } },
          { $unwind: { path: "$artIds", preserveNullAndEmptyArrays: true } },
          { $skip: pageIndex * pageSize },
          { $limit: pageSize },
          {
            $group: {
              _id: "$_id",
              artIds: { $push: "$artIds" },
            },
          },
        ])
        .exec();

      if (userAggregate.length === 0)
        return response.status(200).json({ success: true, payload: [] });

      const userData = userAggregate[0];
      const userArtIds = userData.artIds;

      const simplifiedArts = await artModel
        .aggregate([
          { $match: { _id: { $in: userArtIds } } },
          { $project: { _id: 1, title: 1, description: 1 } },
        ])
        .exec();

      return response
        .status(200)
        .json({ success: true, payload: simplifiedArts.reverse() });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ success: false });
    }
  }
);

function validatePageIndexAndPageSize(pageIndex, pageSize) {
  return !(
    isNaN(pageIndex) ||
    isNaN(pageSize) ||
    pageIndex < 0 ||
    pageSize < 1 ||
    pageSize > 12
  );
}

function validateUserId(userId) {
  return typeof userId === "string" && userId.length === 24;
}

export default router;
