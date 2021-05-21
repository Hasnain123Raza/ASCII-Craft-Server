import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  if (Boolean(request.user)) request.logOut();

  response.status(200).json({ success: true });
});

export default router;
