const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const connectRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5004;

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

// Mount all routes
app.use("/api/connect", connectRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found in Connect Service" });
});

app.listen(PORT, () => {
    console.log(`Connect Service listening on port ${PORT}`);
});
