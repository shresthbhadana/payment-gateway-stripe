const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const fraudRoutes = require("./routes/index");
const app = express();
const PORT = process.env.PORT || 5005;

connectDB();
app.use(cors());

app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    })
);
app.use(express.urlencoded({ extended: true }));

app.use("/api/fraud", fraudRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found in Fraud & Risk Service" });
});
app.listen(PORT, () => {
    console.log(`Fraud & Risk Service listening on port ${PORT}`);
});