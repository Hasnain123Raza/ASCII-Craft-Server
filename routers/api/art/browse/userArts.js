import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";

export async function getUserArtCount(userId) {
  const userAggregate = await userModel
    .aggregate([
      { $match: { _id: userId } },
      { $project: { totalArtsCreated: { $size: "$artIds" } } },
    ])
    .exec();

  return userAggregate[0]?.totalArtsCreated;
}

export async function getUserSimplifiedArts(userId, pageIndex, pageSize) {
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

  if (userAggregate.length === 0) return [];

  const userData = userAggregate[0];
  const userArtIds = userData.artIds;

  const simplifiedArts = await artModel
    .aggregate([
      { $match: { _id: { $in: userArtIds } } },
      { $project: { _id: 1, title: 1, description: 1 } },
    ])
    .exec();

  return simplifiedArts.reverse();
}
