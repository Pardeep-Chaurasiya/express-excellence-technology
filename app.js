const express = require("express");
const dotenv = require("dotenv").config();
const db = require("./config/db")();

const app = express();

app.use(express.json());

require("./models/userSchema");
const userRoute = require("./routes/userRoutes");
app.use("/", userRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
