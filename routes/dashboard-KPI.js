const express = require("express");
const { getTotalOrders, getShipmentStatusPercentage } = require("../Controllers/dashboard-KPI");

const router = express.Router();

// 📌 Route: Get Total Orders Count
router.get("/total-orders", getTotalOrders);

// 📌 Route: Get Shipment Status Percentages
router.get("/shipment-status-percentage", getShipmentStatusPercentage);

module.exports = router;
