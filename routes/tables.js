const express = require("express");
const { getRecentOrders } = require("../Controllers/tables");

const router = express.Router();

// 📌 API: Get 5 Recent Orders with Product, Category & Shipment Data
router.get("/recent-orders", getRecentOrders);

module.exports = router;
