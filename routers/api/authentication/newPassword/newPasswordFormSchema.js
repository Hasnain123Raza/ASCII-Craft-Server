import Joi from "joi";

export default Joi.object({
  _id: Joi.string().required(),
  token: Joi.string().guid().required(),
  password: Joi.string().min(10).max(100).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 10 characters long.",
    "string.max": "Password must be less than or equal to 100 characters long.",
  }),
});
