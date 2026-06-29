const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const taxRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5007;

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

app.use("/api/tax", taxRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found in Tax Service" });
});

app.listen(PORT, () => {
    console.log(`Tax & Accounting Service listening on port ${PORT}`);
});
