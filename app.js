require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Minimal Mongoose schema & model for search history
const searchSchema = new mongoose.Schema({
  city: String,
  country: String,
  temperature: Number,
  weather: String,
  humidity: Number,
  windSpeed: Number,
  searchedAt: { type: Date, default: Date.now }
});
const Search = mongoose.model('Search', searchSchema);

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

    // assume `data` is the API response
const s = new Search({
  city: data.name,
  country: data.sys.country,
  temperature: data.main.temp,
  weather: data.weather[0].description,
  humidity: data.main.humidity,
  windSpeed: data.wind.speed
});
s.save().catch(err => console.log('DB save error:', err));


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

app.get('/history-page', async (req, res) => {
  try {
    const history = await Search.find().sort({ searchedAt: -1 }).limit(10);

    let html = `
      <html>
        <head>
          <title>Search History</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Last 10 Searches</h1>
          <table>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th>Temp (°C)</th>
              <th>Weather</th>
              <th>Humidity</th>
              <th>Wind Speed</th>
              <th>Date</th>
            </tr>
    `;

    history.forEach(item => {
      html += `
        <tr>
          <td>${item.city}</td>
          <td>${item.country}</td>
          <td>${item.temperature}</td>
          <td>${item.weather}</td>
          <td>${item.humidity}%</td>
          <td>${item.windSpeed} m/s</td>
          <td>${item.searchedAt.toLocaleString()}</td>
        </tr>
      `;
    });

    html += `
          </table>
          <br><a href="/">Back to search</a>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching history');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
