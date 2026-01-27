const express = require("express");
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");

const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestsRouter = require("./src/routes/request");

const app = express();

app.use(express.json());
app.use(cookieParser());

// mount routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);

// fallback
app.use((req, res) => res.status(404).send("Not Found"));

connectDB()
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, "127.0.0.1", () => {
      console.log("Server is running and listening on 127.0.0.1:3000");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!", err);
  });
