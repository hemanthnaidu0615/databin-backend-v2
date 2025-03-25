const { queryPinot } = require("../config/pinot");

exports.getRecentOrders = async (req, res) => {
    try {
        // Step 1: Fetch the latest 5 orders
        const ordersQuery = `
            SELECT order_id, product_id, unit_price, order_type
            FROM orders
            ORDER BY order_date DESC
            LIMIT 5
        `;
        const ordersData = await queryPinot(ordersQuery);

        if (!ordersData?.resultTable?.rows?.length) {
            return res.json({ message: "No recent orders found." });
        }

        const orders = ordersData.resultTable.rows;
        console.log("Fetched Orders:", orders);

        // Extract product_ids and order_ids
        const productIds = orders.map(order => order[1]).join(",");
        const orderIds = orders.map(order => order[0]).join(",");

        // Step 2: Fetch Product Names and Category IDs
        const productQuery = `
            SELECT id, name, category_id
            FROM products
            WHERE id IN (${productIds})
        `;
        const productData = await queryPinot(productQuery);
        const productMap = new Map(productData.resultTable.rows.map(row => [row[0], { name: row[1], category_id: row[2] }]));

        // Step 3: Fetch Category Names
        const categoryIds = [...new Set(productData.resultTable.rows.map(row => row[2]))].join(",");
        const categoryQuery = `
            SELECT id, name
            FROM categories
            WHERE id IN (${categoryIds})
        `;
        const categoryData = await queryPinot(categoryQuery);
        const categoryMap = new Map(categoryData.resultTable.rows.map(row => [row[0], row[1]]));

        // Step 4: Fetch Shipment Status
        const shipmentQuery = `
            SELECT order_id, shipment_status
            FROM shipment
            WHERE order_id IN (${orderIds})
        `;
        const shipmentData = await queryPinot(shipmentQuery);
        const shipmentMap = new Map(shipmentData.resultTable.rows.map(row => [row[0], row[1]]));

        // Step 5: Merge All Data
        const enrichedOrders = orders.map(order => {
            const product = productMap.get(order[1]) || { name: "N/A", category_id: null };
            const categoryName = categoryMap.get(product.category_id) || "N/A";
            const shipmentStatus = shipmentMap.get(order[0]) || "Pending"; // Default to "Pending" if not found

            return {
                order_id: order[0],
                product_name: product.name,
                category: categoryName,
                price: order[2],
                status: shipmentStatus,
                order_type: order[3]
            };
        });

        res.json(enrichedOrders);
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({ error: "Failed to fetch recent orders" });
    }
};
