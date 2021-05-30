export default function authenticated(request, response, next) {
  if (Boolean(request.user)) next();
  else
    response
      .status(403)
      .json({ success: false, error: { unauthenticated: true } });
}
