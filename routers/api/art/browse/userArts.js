import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";
import mongodb from "mongodb";

export async function getUserArtCount({ type, payload }) {
  payload = new mongodb.ObjectId(payload);

  if (type === "createdByUserId") {
    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: payload } },
        { $project: { totalArtsCreated: { $size: "$createdArtIds" } } },
      ])
      .exec();

    return userAggregate[0]?.totalArtsCreated;
  } else if (type === "likedByUserId") {
    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: payload } },
        { $project: { totalArtsLiked: { $size: "$likedArtIds" } } },
      ])
      .exec();

    return userAggregate[0]?.totalArtsLiked;
  }
}

export async function getUserSimplifiedArts(
  { type, payload },
  pageIndex,
  pageSize
) {
  payload = new mongodb.ObjectId(payload);

  if (type === "createdByUserId") {
    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: payload } },
        {
          $project: {
            _id: 1,
            createdArtIds: { $reverseArray: "$createdArtIds" },
          },
        },
        {
          $unwind: { path: "$createdArtIds", preserveNullAndEmptyArrays: true },
        },
        { $skip: pageIndex * pageSize },
        { $limit: pageSize },
        {
          $group: {
            _id: "$_id",
            createdArtIds: { $push: "$createdArtIds" },
          },
        },
      ])
      .exec();

    if (userAggregate.length === 0) return [];

    const userData = userAggregate[0];
    const userArtIds = userData.createdArtIds;

    const simplifiedArts = await artModel
      .aggregate([
        { $match: { _id: { $in: userArtIds } } },
        { $project: { _id: 1, title: 1, description: 1 } },
      ])
      .exec();

    return simplifiedArts;
  } else if (type === "likedByUserId") {
    const userAggregate = await userModel
      .aggregate([
        { $match: { _id: payload } },
        {
          $project: {
            _id: 1,
            likedArtIds: { $reverseArray: "$likedArtIds" },
          },
        },
        {
          $unwind: { path: "$likedArtIds", preserveNullAndEmptyArrays: true },
        },
        { $skip: pageIndex * pageSize },
        { $limit: pageSize },
        {
          $group: {
            _id: "$_id",
            likedArtIds: { $push: "$likedArtIds" },
          },
        },
      ])
      .exec();

    if (userAggregate.length === 0) return [];

    const userData = userAggregate[0];
    const userArtIds = userData.likedArtIds;

    const simplifiedArts = await artModel
      .aggregate([
        { $match: { _id: { $in: userArtIds } } },
        { $project: { _id: 1, title: 1, description: 1 } },
      ])
      .exec();

    return simplifiedArts;
  }
}
