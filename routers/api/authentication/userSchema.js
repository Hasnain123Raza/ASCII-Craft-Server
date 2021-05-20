import Joi from "joi";

export default Joi.object({
  username: Joi.string().alphanum().trim().min(3).max(20).required(),
  password: Joi.string().min(10).max(100).required(),
});
