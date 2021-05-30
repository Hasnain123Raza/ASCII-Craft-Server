export default (validationSchema) => (request, response, next) => {
  const data = request.body;

  const validationResult = validationSchema.validate(data);

  if (Boolean(validationResult.error)) {
    const { message, path } = validationResult.error.details[0];
    return response
      .status(400)
      .json({ success: false, error: { message, path } });
  }

  next();
};