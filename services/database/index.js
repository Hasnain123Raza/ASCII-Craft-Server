import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

export default await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "ASCII-CRAFT",
});
