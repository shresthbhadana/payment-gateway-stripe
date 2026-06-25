const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/health", (req, res) => {
    res.json({
        service: "Gateway Service",
        status: "UP",
        timestamp: new Date().toISOString()
    });
});

app.use(
    "/api/orders",
    createProxyMiddleware({
        target: process.env.ORDER_SERVICE_URL || "http://127.0.0.1:5002",
        changeOrigin: true,
    })
);

app.use(
    "/api/payments",
    createProxyMiddleware({
        target: process.env.PAYMENT_SERVICE_URL || "http://127.0.0.1:5001",
        changeOrigin: true,
    })
);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found in API Gateway" });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
