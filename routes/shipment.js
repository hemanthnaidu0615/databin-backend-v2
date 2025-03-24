const express = require("express");
const { queryPinot } = require("../config/pinot");

const router = express.Router();

// 📌 API: Get Percentage of Delayed Orders
router.get("/delayed-orders-percentage", async (req, res) => {
    try {
        // Optimized query to get total orders and delayed orders count in a single query
        const query = `
            SELECT 
                COUNT(*) AS total_orders,
                SUM(CASE WHEN shipment_status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_orders
            FROM shipment
        `;

        const data = await queryPinot(query);
        
        if (!data?.resultTable?.rows?.length) {
            return res.json({ error: "No shipment data available." });
        }

        const [totalOrders, delayedOrders] = data.resultTable.rows[0];

        // Calculate the percentage of delayed orders
        const delayedPercentage = totalOrders > 0 ? (delayedOrders / totalOrders) * 100 : 0;

        res.json({ delayed_percentage: delayedPercentage.toFixed(2) });
    } catch (error) {
        console.error("Error fetching delayed orders percentage:", error);
        res.status(500).json({ error: "Failed to fetch delayed orders percentage" });
    }
});

module.exports = router;
