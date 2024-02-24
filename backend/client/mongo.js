const mongoose = require("mongoose");

// Enable debugging to see what Mongoose is doing under the hood
mongoose.set("debug", true);

// Connect to MongoDB using the connection string from your environment variables
mongoose.connect(process.env.DATABASE_URL);

mongoose.set("debug", process.env.MONGOOSE_DEBUG === "true");

// Shortcut to mongoose.connection object
const db = mongoose.connection;

db.on("connected", function () {
  console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.on("disconnected", () => console.log("MongoDB disconnected"));