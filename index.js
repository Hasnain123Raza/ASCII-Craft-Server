import express from "express";
import passport from "passport";
import session from "./services/session/index.js";

import routers from "./routers/index.js";

import "./services/database/index.js";
import "./services/passport/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routers);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`ASCII-Craft App listening at port: ${server.address().port}`);
});
