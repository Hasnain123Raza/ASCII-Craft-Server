import express from "express";

import authenticatedRouter from "./authenticated/index.js";
import emailVerificationRouter from "./emailVerification/index.js";
import loginRouter from "./login/index.js";
import logoutRouter from "./logout/index.js";
import registerRouter from "./register/index.js";

const router = express.Router();

router.use("/authenticated", authenticatedRouter);
router.use("/emailverification", emailVerificationRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/register", registerRouter);

export default router;
