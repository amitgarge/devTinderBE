const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://ameet_garge_dbUser:FkF46ZXULs@namastenode.lqql7x7.mongodb.net/devTinder")
}

module.exports=connectDB;

