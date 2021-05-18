import mongoose from "mongoose";

const artSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  created: {
    type: Date,
    default: Date.now,
  },

  // ownerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  likes: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Art", artSchema);
