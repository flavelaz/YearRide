const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "GPX Year Report API läuft" });
});

"Loggin Routen"
app.use("/api/auth", require("./routes/authRoutes"));

"Fahrten Routen"
app.use("/api/rides", require("./routes/rideRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
