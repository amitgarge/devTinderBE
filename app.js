const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send({ firtName: "Amit", lastName: "Garge" });
});

app.post("/user", (req, res) => {
  //Saving the data to the DB
  res.send("Data successfully saved to the DB.");
});

app.delete("/user", (req, res)=>{
  res.send("Deleted successfully!")
})

app.put("/user", (req,res)=>{
  res.send("Updated Successfully");
})

app.patch("/user", (req,res)=>{
  res.send("Updated Successfully!")
})

app.use("/", (req, res) => {
  res.send("Hello from the server");
});

app.listen(3000, () => {
  console.log("Server is running and listening on the port 3000");
});
