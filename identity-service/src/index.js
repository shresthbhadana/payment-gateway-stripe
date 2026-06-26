const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const identityRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5006;

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

app.use("/api/identity", identityRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found in Identity Service" });
});

app.listen(PORT, () => {
    console.log(`Identity & Verification Service listening on port ${PORT}`);
});
