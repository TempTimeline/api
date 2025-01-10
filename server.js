const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

// GitHub Repository Details
const GITHUB_API_URL =
  "https://api.github.com/repos/HuntingStats378/weather/contents/norwich.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set your GitHub token in the .env file

app.get("/json", async (req, res) => {
  try {
    const { limit } = req.query; // Optional query parameter to specify the number of data points
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw",
      },
    });

    // If the response is a Buffer or String, parse it into JSON
    const rawData = response.data;
    const parsedData =
      typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    // Check if limit is provided and slice the array
    const limitedData = limit
      ? parsedData.slice(-Math.min(limit, parsedData.length))
      : parsedData;

    // Return the data as JSON
    res.json(limitedData);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from GitHub" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
