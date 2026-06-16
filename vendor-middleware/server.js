const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.get("/", (req, res) => {
  res.send(" Server Running");
});

const vendorRoutes = require("./routes/vendor.routes");
app.use("/api/vendor", vendorRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});