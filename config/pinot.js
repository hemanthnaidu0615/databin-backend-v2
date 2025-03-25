require("dotenv").config();

const axios = require("axios");

const pinotConfig = {
    brokerUrl: "https://broker.pinot.celpxu.cp.s7e.startree.cloud:443",
    controllerUrl: "https://data.celpxu.cp.s7e.startree.cloud",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.STAR_TREE_AUTH_TOKEN}`,
        "database": "ws_2tcna4wdsaga"
    }
};

const queryPinot = async (sql) => {
    try {
        const response = await axios.post(
            `${pinotConfig.brokerUrl}/query/sql`,
            { sql,
                queryOptions: "useMultistageEngine=true"
             },
            { headers: pinotConfig.headers }
        );
        return response.data;
    } catch (error) {
        console.error("Error querying Pinot:", error.response?.data || error.message);
        throw new Error("Failed to query Pinot");
    }
};

module.exports = { pinotConfig, queryPinot };
