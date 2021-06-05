import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    rank: {
      type: String,
      default: "unverified",
    },

    created: {
      type: Date,
      default: Date.now,
    },

    unverifiedEmailCooldown: {
      type: Number,
      default: 0,
    },

    artIds: [mongoose.Schema.Types.ObjectId],
    artCreateCooldown: {
      type: Number,
      default: 0,
    },
  },
  { strict: false }
);

export default mongoose.model("User", userSchema);
