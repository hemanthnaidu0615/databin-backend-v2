const express = require("express");
const { getTotalOrders, getShipmentStatusPercentage, getFulfillmentRate } = require("../Controllers/dashboard-KPI");

const router = express.Router();

// 📌 Route: Get Total Orders Count
router.get("/total-orders", getTotalOrders);

// 📌 Route: Get Shipment Status Percentages
router.get("/shipment-status-percentage", getShipmentStatusPercentage);

router.get("/fulfillment-rate", getFulfillmentRate);

module.exports = router;
