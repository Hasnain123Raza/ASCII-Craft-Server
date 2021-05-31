import Joi from "joi";

export default Joi.object({
  title: Joi.string().trim().min(1).max(30).required().messages({
    "string.empty": "Title is required.",
    "string.min": "Title must be at least 1 characters long.",
    "string.max": "Title must be less than or equal to 30 characters long.",
  }),
  description: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 1 characters long.",
    "string.max":
      "Description must be less than or equal to 100 characters long.",
  }),
  content: Joi.string().min(1).max(4000).required().messages({
    "string.empty": "Content is required.",
    "string.min": "Content must be at least 1 characters long.",
    "string.max": "Content must be less than or equal to 4000 characters long.",
  }),
});
