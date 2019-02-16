require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var app = express();
const mongoose = require("mongoose");

const appPort = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL || "localhost";
const mongoPort = process.env.MONGO_PORT || "27018";

const postsRouter = require("./routes/posts");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/posts", postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(appPort, () => {
  console.log("Server runnig!");

  mongoose.connect(`mongodb://${mongoUrl}:${mongoPort}/redis-example`, () =>
    console.log("MongoDB running!")
  );
});

module.exports = app;
