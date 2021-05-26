import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  permission: {
    type: String,
    default: "normalUser",
  },
  artIds: [mongoose.Schema.Types.ObjectId],
});

export default mongoose.model("User", userSchema);
