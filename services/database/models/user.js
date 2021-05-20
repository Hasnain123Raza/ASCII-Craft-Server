import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  permission: {
    type: String,
    default: "normalUser",
  },
});

export default mongoose.model("User", userSchema);
