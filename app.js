require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./src/middlewares/errorHandler");
const AppError = require("./src/util/AppError");

const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestsRouter = require("./src/routes/request");
const userRouter = require("./src/routes/user");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// mount routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/request", requestsRouter);
app.use("/api/v1/user", userRouter);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

connectDB()
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, "localhost", () => {
      console.log("Server is running and listening on localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!", err);
  });
