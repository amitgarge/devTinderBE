const dotenv = require("dotenv");

const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";

dotenv.config({ path: envFile });

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

const allowedOrigins = [process.env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/request", requestsRouter);
app.use("/api/v1/user", userRouter);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!", err);
  });
