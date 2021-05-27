import express from "express";

import browseRouter from "./browse/index.js";
import createRouter from "./create/index.js";
import deleteRouter from "./delete/index.js";
import openRouter from "./open/index.js";

const router = express.Router();

router.use("/browse", browseRouter);
router.use("/create", createRouter);
router.use("/delete", deleteRouter);
router.use("/open", openRouter);

export default router;
