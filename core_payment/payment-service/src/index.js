const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Config - Initialize environment variables first
dotenv.config();

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// DB Connect
connectDB();

app.use(cors());

// Webhook requires raw request buffer for signature verification
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    })
);

app.use(express.urlencoded({ extended: true }));

// Routing mounts
app.use("/", paymentRoutes);

app.listen(PORT, () => {
    console.log(`Payment Service listening on port ${PORT}`);
});
