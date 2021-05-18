import express from "express";
import db from "./services/database/index.js";

import routers from "./routers/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routers);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`ASCII-Craft App listening at port: ${server.address().port}`);
});
