const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// GitHub Repository Details
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set your GitHub token in the .env file
const FORECAST_TOKEN = process.env.FORECAST_TOKEN;
const GITHUB_FILE_PATHS = process.env.GITHUB_FILE_PATH; // Comma-separated paths

// Fetch data from multiple GitHub files
const fetchGitHubData = async (filePaths) => {
    try {
        const fileFetchPromises = filePaths.map(async (filePath) => {
            const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3.raw",
                },
            });
            return response.data; // JSON content of the file
        });

        // Wait for all file fetches to complete
        const filesData = await Promise.all(fileFetchPromises);

        // Combine all data into a single array
        return filesData.flat();
    } catch (error) {
        console.error("Error fetching data from GitHub:", error.message);
        throw new Error("Failed to fetch data from GitHub");
    }
};

app.get("/json", async (req, res) => {
  try {
    const { limit } = req.query; // Optional query parameter to specify the number of data points
    // Split file paths from .env into an array
        const filePaths = GITHUB_FILE_PATHS.split(',');

        // Fetch data from GitHub files
        let githubData = await fetchGitHubData(filePaths);

    // If the response is a Buffer or String, parse it into JSON
    const rawData = githubData;
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

// Define the forecast endpoint
app.get('/forecast', async (req, res) => {
    try {
        // Fetch data from Visual Crossing Weather API
        const response = await axios.get('https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/norwich', {
            params: {
                unitGroup: 'metric',
                include: 'hours,current',
                key: FORECAST_TOKEN,
                contentType: 'json'
            }
        });

        // Send the fetched JSON content as the response
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
