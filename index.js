import path from "path";
import express from "express";
import passport from "passport";
import session from "./services/session/index.js";

import routers from "./routers/index.js";

import "./services/database/index.js";
import "./services/passport/index.js";
import "./services/mail/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routers);

const __dirname = path.resolve(path.dirname(""));
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`ASCII-Craft App listening at port: ${server.address().port}`);
});

// await (async () => {
//   const payload = {
//     id: "abc",
//     exp: Math.floor(Date.now() / 1000),
//   };
//   const token = jwt.sign(payload, process.env.JWT_SECRET);
//   console.log(token);
//   const verified = jwt.verify(token, process.env.JWT_SECRET);
//   console.log(verified);
// })();
