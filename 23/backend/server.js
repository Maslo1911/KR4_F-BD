const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || "unknown";

app.get("/", (req, res) => {
    res.json({
        server: `backend-${SERVER_ID}`,
        port: PORT,
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`Backend-${SERVER_ID} запущен на порту ${PORT}`);
});