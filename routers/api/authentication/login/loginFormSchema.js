import Joi from "joi";

const userSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a correct email.",
    }),
  password: Joi.string().min(10).max(100).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 10 characters long.",
    "string.max": "Password must be less than or equal to 100 characters long.",
  }),
});

export default Joi.object({
  user: userSchema,
  recaptchaToken: Joi.string().required().messages({
    "string.empty": "reCaptcha is required.",
  }),
});
