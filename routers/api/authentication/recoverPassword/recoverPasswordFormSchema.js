import Joi from "joi";

import { email } from "../validationSchemas.js";

export default Joi.object({
  email,
});
