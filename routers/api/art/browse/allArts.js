import artModel from "../../../../services/database/models/art.js";
import userModel from "../../../../services/database/models/user.js";

export async function getAllArtCount() {
  return await artModel.find().estimatedDocumentCount();
}

export async function getAllSimplifiedArts(pageIndex, pageSize) {
  return await artModel
    .aggregate([
      { $sort: { likes: -1, created: -1 } },
      { $project: { _id: 1, title: 1, description: 1 } },
      { $skip: pageIndex * pageSize },
      { $limit: pageSize },
    ])
    .exec();
}
