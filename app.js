const express = require("express");
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

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
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

// fallback
app.use((req, res) => res.status(404).send({ message: "Route Not Found" }));

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
