import express from "express";
import userModel from "../../../../services/database/models/user.js";
import userSchema from "../userSchema.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (request, response) => {
  const data = request.body;

  const validationResult = userSchema.validate(data);
  if (validationResult.error) {
    const { message, path } = validationResult.error.details[0];
    return response
      .status(400)
      .json({ success: false, error: { message, path } });
  }

  try {
    const { username, password } = data;

    const duplicate = await userModel
      .findOne({ username })
      .collation({ locale: "en", strength: 1 });

    if (duplicate) {
      return response.status(400).json({
        success: false,
        error: {
          message: "Username is not unique.",
          path: ["username"],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const model = new userModel({
      username,
      password: hashedPassword,
    });
    const savedResponse = await model.save();

    response.status(200).json({
      success: true,
      payload: {
        _id: savedResponse._id,
        username: savedResponse.username,
        permission: savedResponse.permission,
      },
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({ success: false });
  }
});

export default router;
