const { queryPinot } = require("../config/pinot");

// 📌 Get Recent Orders with Product & Category Data
const getRecentOrders = async (req, res) => {
    try {
        // Step 1: Fetch latest 5 orders
        const ordersQuery = `SELECT order_id, product_id, unit_price, order_type FROM orders ORDER BY order_date DESC LIMIT 5`;
        const ordersData = await queryPinot(ordersQuery);

        if (!ordersData?.resultTable?.rows?.length) {
            return res.json({ message: "No recent orders found." });
        }

        const orders = ordersData.resultTable.rows;
        const productIds = [...new Set(orders.map(order => order[1]))];

        // Step 2: Fetch Product Data
        if (productIds.length === 0) return res.json({ orders });

        const productQuery = `SELECT id AS product_id, name AS product_name, category_id FROM products WHERE id IN (${productIds.join(",")})`;
        const productData = await queryPinot(productQuery);
        const productMap = new Map(productData.resultTable.rows.map(row => [row[0], { name: row[1], category_id: row[2] }]));

        // Step 3: Fetch Category Data
        const categoryIds = [...new Set(productData.resultTable.rows.map(row => row[2]))];
        const categoryQuery = `SELECT id AS category_id, name AS category_name FROM categories WHERE id IN (${categoryIds.join(",")})`;
        const categoryData = await queryPinot(categoryQuery);
        const categoryMap = new Map(categoryData.resultTable.rows.map(row => [row[0], row[1]]));

        // Step 4: Merge Data
        const enrichedOrders = orders.map(order => {
            const product = productMap.get(order[1]) || { name: "N/A", category_id: null };
            const categoryName = categoryMap.get(product.category_id) || "N/A";

            return {
                order_id: order[0],
                product_name: product.name,
                category: categoryName,
                price: order[2],
                order_type: order[3]
            };
        });

        res.json(enrichedOrders);
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({ error: "Failed to fetch recent orders" });
    }
};

module.exports = { getRecentOrders };
