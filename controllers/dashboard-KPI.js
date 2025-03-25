const { queryPinot } = require("../config/pinot");

// 📌 API: Get Total Orders Count
exports.getTotalOrders = async (req, res) => {
    try {
        const query = "SELECT COUNT(*) FROM orders";
        const data = await queryPinot(query);

        if (!data?.resultTable?.rows?.length) {
            return res.json({ total_orders: 0 });
        }

        const totalOrders = data.resultTable.rows[0][0];
        res.json({ total_orders: totalOrders });
    } catch (error) {
        console.error("Error fetching total orders:", error);
        res.status(500).json({ error: "Failed to fetch total orders" });
    }
};

// 📌 API: Get Percentages of Delayed & In-Transit Orders
exports.getShipmentStatusPercentage = async (req, res) => {
    try {
        // Optimized query to fetch total orders, delayed, and in-transit orders in one go
        const query = `
            SELECT 
                COUNT(*) AS total_orders,
                SUM(CASE WHEN shipment_status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_orders,
                SUM(CASE WHEN shipment_status = 'In Transit' THEN 1 ELSE 0 END) AS in_transit_orders
            FROM shipment
        `;

        const data = await queryPinot(query);

        if (!data?.resultTable?.rows?.length) {
            return res.json({ delayed_percentage: 0, in_transit_percentage: 0 });
        }

        const [totalOrders, delayedOrders, inTransitOrders] = data.resultTable.rows[0];

        // Calculate percentages
        const delayedPercentage = totalOrders ? ((delayedOrders / totalOrders) * 100).toFixed(2) : "0.00";
        const inTransitPercentage = totalOrders ? ((inTransitOrders / totalOrders) * 100).toFixed(2) : "0.00";

        res.json({ delayed_percentage: delayedPercentage, in_transit_percentage: inTransitPercentage });
    } catch (error) {
        console.error("Error fetching shipment percentages:", error);
        res.status(500).json({ error: "Failed to fetch shipment percentages" });
    }
};

exports.getFulfillmentRate = async (req, res) => {
    try {
        const query = `
            SELECT 
           (COUNT(e.order_id) * 100.0 / NULLIF(COUNT(o.order_id), 0)) AS fulfillment_rate
           FROM orders o
           LEFT JOIN fulfillment_event e 
           ON o.order_id = e.order_id
           AND e.event_type IN ('Shipped', 'Same-Day Delivery', 'Ship to Home', 
                     'Store Pickup', 'Curbside Pickup', 'Locker Pickup');`

        // Explicitly enable Multi-Stage Query Engine
        const data = await queryPinot(query, { queryOptions: "useMultistageEngine=true" });

        if (!data?.resultTable?.rows?.length || data.resultTable.rows[0][0] === null) {
            return res.json({ message: "No fulfillment data available." });
        }

        const [fulfillmentRate] = data.resultTable.rows[0];

        res.json({
            fulfillment_rate: `${fulfillmentRate.toFixed(2)}%`
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch fulfillment rate" });
    }
};
