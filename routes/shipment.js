const express = require("express");
const { queryPinot } = require("../config/pinot");

const router = express.Router();

// 📌 Optimized API: Get Percentages of Delayed & In-Transit Orders
router.get("/shipment-status-percentage", async (req, res) => {
    try {
        // Optimized query to get total orders and both delayed & in-transit counts
        const query = `
            SELECT 
                COUNT(*) AS total_orders,
                SUM(CASE WHEN shipment_status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_orders,
                SUM(CASE WHEN shipment_status = 'In Transit' THEN 1 ELSE 0 END) AS in_transit_orders
            FROM shipment
        `;

        const data = await queryPinot(query);

        console.log("Query Response:", data); // Debugging: Check if response is valid
        
        if (!data?.resultTable?.rows?.length) {
            return res.json({ error: "No shipment data available." });
        }

        const [totalOrders, delayedOrders, inTransitOrders] = data.resultTable.rows[0];

        // Calculate percentages
        const delayedPercentage = totalOrders > 0 ? (delayedOrders / totalOrders) * 100 : 0;
        const inTransitPercentage = totalOrders > 0 ? (inTransitOrders / totalOrders) * 100 : 0;

        res.json({ 
            delayed_percentage: delayedPercentage.toFixed(2), 
            in_transit_percentage: inTransitPercentage.toFixed(2) 
        });
    } catch (error) {
        console.error("Error fetching shipment percentages:", error);
        res.status(500).json({ error: "Failed to fetch shipment percentages" });
    }
});

module.exports = router;
