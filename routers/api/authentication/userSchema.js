import Joi from "joi";

const userSchema = Joi.object({
  username: Joi.string().alphanum().trim().min(3).max(20).required(),
  password: Joi.string().min(10).max(100).required(),
});

export default Joi.object({
  user: userSchema,
  recaptchaToken: Joi.string().required(),
});
