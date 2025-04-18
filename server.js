require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const ordersRoutes = require("./routes/tables");
const dashboardKPI = require("./routes/dashboard-KPI");

// Use Routes
app.use("/api/orders", ordersRoutes);
app.use("/api/dashboard-kpi", dashboardKPI);


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
