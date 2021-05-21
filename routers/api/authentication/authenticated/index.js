import express from "express";

const router = express.Router();

router.post("/", (request, response) => {
  response
    .status(200)
    .json({ success: true, payload: { authenticated: Boolean(request.user) } });
});

export default router;
