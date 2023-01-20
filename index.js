const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());
// gitgitgti
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);
// ok

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome on my Server !" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: `This route doesn't exist` });
});

app.listen(process.env.PORT, () => {
  console.log(`server started`);
});
