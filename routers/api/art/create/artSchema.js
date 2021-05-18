import Joi from "joi";

export default Joi.object({
  title: Joi.string().trim().min(1).max(30).required(),
  description: Joi.string().trim().min(1).max(100).required(),
  content: Joi.string().min(1).max(4000).required(),
});
