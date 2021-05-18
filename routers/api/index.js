import express from "express";

import accountRouter from "./account/index.js";
import artRouter from "./art/index.js";
import authenticationRouter from "./authentication/index.js";

const router = express.Router();

router.use("/account", accountRouter);
router.use("/art", artRouter);
router.use("/authentication", authenticationRouter);

export default router;
