import express from "express";

import dashboardRouter from "./dashboard/index.js";
import profileRouter from "./profile/index.js";

const router = express.Router();

router.use("/dashboard", dashboardRouter);
router.use("/profile", profileRouter);

export default router;
