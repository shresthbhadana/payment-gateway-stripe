const express =  require("express");
const cors  = require("cors");
const dotenv = require("dotenv")
dotenv.config();
const connectDB = require('./config/db.js');
const bankingRoutes = require("./routes/index");
const app = express();
const PORT = process.env.Port || 5008;

connectDB();

app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    })
);
app.use(express.urlencoded({ extended: true }));
app.use("/api/banking", bankingRoutes);
app.use((req, res) => {
    res.status(404).json({ error: "Route not found in Banking Service" });
});
app.listen(PORT, () => {
    console.log(`Banking & Financial Services listening on port ${PORT}`);
});