const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json({ limit: "10kb" }));
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const server = app.listen(3000);

app
  .get("/login", (req, res, next) => {
    res.status(200).render("login", { qs: req.body });
  })
  .post("/login", (req, res, next) => {
    console.log(req.body);
    res.status(200).render("login", { qs: req.body });
  });
