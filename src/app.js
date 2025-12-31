const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("Hello test test!");
});

app.use("/", (req, res) => {
  res.send("Hello from the server");
});

app.listen(3000, () => {
  console.log("Server is running and listening on the port 3000");
});
