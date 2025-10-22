// app.js
let currentMarker = null;

const map = L.map('map', {
    maxBounds: [
        [41.675105, -141.0], // South West
        [83.23324, -52.648098] // North East
    ],
    maxBoundsVisble: true // Prevents the user from panning outside the bounds
}).setView([56.1304, -106.3468], 4);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


// Function to fetch weather data based on latitude and longitude
async function fetchWeatherData(lat, lng) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    try {
        const response = await fetch(apiUrl);
        const weatherData = await response.json();
        return weatherData.current_weather; // Return the current weather
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}


// Function to add a marker with weather information to the map
// Function to add a marker with weather information to the map
async function addMarker(lat, lng, weather) {
    // Reverse geocoding to get the city name
    const cityName = await getCityName(lat, lng); // Await the city name retrieval

    // Remove existing marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create a new marker and add it to the map
    currentMarker = L.marker([lat, lng]).addTo(map);
    
    // Create a dynamic message based on selected weather metric
    const metric = document.getElementById('weatherMetric').value;
    let weatherInfo = '';

    switch (metric) {
        case 'temperature':
            weatherInfo = `Temperature: ${weather.temperature}°C`;
            break;
        case 'windspeed':
            weatherInfo = `Wind Speed: ${weather.windspeed} km/h`;
            break;
        case 'winddirection':
            // Note: humidity data is not included in current_weather directly
            weatherInfo = `Wind Direction: ${weather.winddirection}°`;
            break;
        case 'precipitation':
            // Note: precipitation is generally not included in current_weather
            weatherInfo = `Precipitation data is not available from the current weather.`;
            break;
        default:
            weatherInfo = `Temperature: ${weather.temperature}°C`;
    }

    // Bind a popup with weather information to the marker
    currentMarker.bindPopup(`
        <h3>${cityName}</h3>
        <p>Current Weather</p>
        <p>${weatherInfo}</p>
    `).openPopup();
}

// Function to get city name based on latitude and longitude
async function getCityName(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        console.log(data);
        return data.address.city || "Unknown Location"; // Return city name if available
    } catch (error) {
        console.error("Error fetching city name:", error);
        return "Unknown Location";
    }
}

// Function to fetch weather data based on latitude and longitude
async function fetchWeatherData(lat, lng) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const weatherData = await response.json();
        console.log(weatherData);

        // Check if the response contains current weather data
        if (weatherData.current_weather) {
            const { temperature, windspeed, winddirection, precipitation } = weatherData.current_weather;
            await addMarker(lat, lng, { temperature, windspeed, winddirection, precipitation }); // Pass the retrieved data
        } else {
            console.error("Weather data not found.");
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}


// Event listener for map clicks
map.on('click', function(e) {
    const { lat, lng } = e.latlng; // Get clicked location's latitude and longitude
    addMarker(lat, lng); // Fetch and add weather data for the clicked location
});

