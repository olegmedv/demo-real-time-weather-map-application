// app.js
const map = L.map('map').setView([56.1304, -106.3468], 4); // Centered on Canada

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
async function addMarker(lat, lng) {
    const weather = await fetchWeatherData(lat, lng);
    if (!weather) return;

    const { temperature, windspeed, winddirection } = weather;

    // Create a new marker and add it to the map
    const marker = L.marker([lat, lng]).addTo(map);
    
    // Bind a popup with weather information to the marker
    marker.bindPopup(`
        <h3>Current Weather</h3>
        <p>Temperature: ${temperature}°C</p>
        <p>Wind Speed: ${windspeed} km/h</p>
        <p>Wind Direction: ${winddirection}°</p>
    `).openPopup();
}

// Event listener for map clicks
map.on('click', function(e) {
    const { lat, lng } = e.latlng; // Get clicked location's latitude and longitude
    addMarker(lat, lng); // Fetch and add weather data for the clicked location
});