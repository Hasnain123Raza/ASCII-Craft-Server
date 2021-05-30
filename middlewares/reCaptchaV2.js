import fetch from "node-fetch";

import dotenv from "dotenv";
dotenv.config();

export default async (request, response, next) => {
  const { recaptchaToken, ...payload } = request.body;

  const googleResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_V2_SECRET_KEY}&response=${recaptchaToken}`,
    {
      method: "POST",
    }
  );

  const { success } = await googleResponse.json();
  if (!success)
    return response.status(400).json({
      success: false,
      error: {
        path: ["form"],
        message: "There was a problem with ReCaptcha. Please try again.",
      },
    });

  request.body = payload;
  next();
};