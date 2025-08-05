require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/weather', async (req, res) => {
  const city = req.query.city;
  const apiKey = process.env.API_KEY;

  if (!city) {
    return res.send("City not provided.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const weatherInfo = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Weather Result</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f8f9fa;
        color: #333;
        padding: 20px;
        text-align: center;
      }
      h2 {
        color: #0077b6;
      }
      p {
        font-size: 18px;
        margin: 10px 0;
      }
      a {
        display: inline-block;
        margin-top: 20px;
        text-decoration: none;
        color: #fff;
        background-color: #0077b6;
        padding: 10px 15px;
        border-radius: 4px;
      }
      a:hover {
        background-color: #023e8a;
      }
    </style>
  </head>
  <body>
    <h2>Weather in ${data.name}, ${data.sys.country}</h2>
    <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    <a href="/">Check another city</a>
  </body>
  </html>
`;
res.send(weatherInfo);

  } catch (error) {
    res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Error</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #fff3f3;
        color: #d00000;
        text-align: center;
        padding: 40px;
      }
      a {
        text-decoration: none;
        color: #fff;
        background-color: #d00000;
        padding: 10px 15px;
        border-radius: 4px;
        display: inline-block;
        margin-top: 20px;
      }
      a:hover {
        background-color: #9a0000;
      }
    </style>
  </head>
  <body>
    <h2>Error: ${error.response?.data?.message || "Something went wrong"}</h2>
    <a href="/">Try again</a>
  </body>
  </html>
`);

  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
