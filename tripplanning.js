// tripplanning.js - ElectriStay Trip Planning functionality

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize map with a slight delay to ensure DOM is ready
  setTimeout(initializeMap, 300);
  
  // Set up event listeners for tab switching
  setupTabListeners();
  
  // Connect the Find Route button to the fetchChargingStations function
  const findRouteButton = document.getElementById('find-route-button');
  if (findRouteButton) {
      findRouteButton.addEventListener('click', fetchChargingStations);
  }
});

// Variables to store map state
let mapInstance = null;
let routeLayer = null;
let startMarker = null;
let endMarker = null;

// Initialize Leaflet map
function initializeMap() {
  // Check if map element exists
  const mapElement = document.getElementById('map');
  if (!mapElement) {
      console.error("Map element not found");
      return;
  }
  
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
      console.error("Leaflet library not loaded");
      return;
  }
  
  // Check if map is already initialized
  if (window.mapInstance) {
      // Just resize existing map
      window.mapInstance.invalidateSize(true);
      return;
  }
  
  try {
      // Create map centered on Switzerland
      window.mapInstance = L.map('map', {
          center: [46.8182, 8.2275],
          zoom: 7,
          zoomControl: true
      });
      
      // Share the map instance with our local variable
      mapInstance = window.mapInstance;
      
      // Add the OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
      }).addTo(mapInstance);
      
      // Add a marker for the ElectriStay central location
      L.marker([46.8182, 8.2275])
          .addTo(mapInstance)
          .bindPopup("<b>ElectriStay Central</b><br>Our premier charging location")
          .openPopup();
      
      console.log("Map initialized successfully");
      
  } catch (error) {
      console.error("Error initializing map:", error);
  }
}

// Set up listeners for tab switching
function setupTabListeners() {
  document.querySelectorAll('.inner-nav-item').forEach(function(tab) {
      tab.addEventListener('click', function() {
          // Check if this is the trip planning tab
          if (this.getAttribute('data-section') === 'trip-planning') {
              console.log("Trip planning tab activated");
              
              // Give the section time to become visible
              setTimeout(function() {
                  // Ensure map is properly sized
                  if (window.mapInstance) {
                      window.mapInstance.invalidateSize(true);
                  } else {
                      // Initialize if not already done
                      initializeMap();
                  }
              }, 300);
          }
      });
  });
}

// Toggle configuration panel
function toggleConfiguration() {
  const configSection = document.getElementById('configuration-section');
  if (configSection) {
      configSection.style.display = configSection.style.display === 'none' || configSection.style.display === '' ? 'block' : 'none';
  }
}

// Main function to fetch charging stations and display route
function fetchChargingStations() {
  // Make sure map is initialized
  if (!mapInstance && window.mapInstance) {
      mapInstance = window.mapInstance;
  }
  
  if (!mapInstance) {
      console.error("Map is not initialized");
      alert("Map is not ready. Please try again in a moment.");
      return;
  }
  
  // Show loading indicator or status message
  const loadingElement = document.createElement('div');
  loadingElement.style.position = 'absolute';
  loadingElement.style.top = '50%';
  loadingElement.style.left = '50%';
  loadingElement.style.transform = 'translate(-50%, -50%)';
  loadingElement.style.padding = '10px 20px';
  loadingElement.style.background = 'rgba(0, 0, 0, 0.7)';
  loadingElement.style.color = 'white';
  loadingElement.style.borderRadius = '5px';
  loadingElement.style.zIndex = '1000';
  loadingElement.innerHTML = 'Finding optimal route...';
  
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
      mapContainer.appendChild(loadingElement);
  }
  
  // Get form values
  let source = document.getElementById("source").value.trim();
  let destination = document.getElementById("destination").value.trim();
  let maxDistance = document.getElementById("max-distance").value;
  let chargeDifference = document.getElementById("charge_difference").value;
  let batteryCapacity = document.getElementById("battery_capacity").value;
  let carModel = document.getElementById("car_model").value.trim();
  let efficiency = document.getElementById("efficiency").value;

  // Validation - check if all required fields are filled
  if (!source || !destination || !maxDistance || !chargeDifference || !batteryCapacity || !carModel || !efficiency) {
      alert("Please enter valid values for all fields.");
      mapContainer.removeChild(loadingElement);
      return;
  }

  // Use Nominatim API to convert addresses to coordinates
  Promise.all([
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}`).then(res => res.json()),
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`).then(res => res.json())
  ]).then(results => {
      let sourceData = results[0][0];
      let destData = results[1][0];

      if (!sourceData || !destData) {
          alert("Invalid locations. Please try again with more specific addresses.");
          mapContainer.removeChild(loadingElement);
          return;
      }

      let sourceLat = parseFloat(sourceData.lat);
      let sourceLon = parseFloat(sourceData.lon);
      let destLat = parseFloat(destData.lat);
      let destLon = parseFloat(destData.lon);

      // Update loading message
      loadingElement.innerHTML = 'Calculating route and finding charging stations...';

      // SOLUTION 1: Try with mode: 'cors' and proper CORS headers
      const apiUrl = `https://planyourjourney.onrender.com/proxy-api?source_lon=${sourceLon}&source_lat=${sourceLat}&dest_lon=${destLon}&dest_lat=${destLat}&maxDistance=${maxDistance}`;
      
      fetch(apiUrl, {
          method: 'GET',
          mode: 'cors', // Explicit CORS mode
          headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin
          }
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`API returned status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => processRouteData(data, sourceLat, sourceLon, destLat, destLon, source, destination, chargeDifference, batteryCapacity, carModel, efficiency, loadingElement))
      .catch(error => {
          console.error("Error fetching route data:", error);
          
          // SOLUTION 2: Try with JSONP approach if CORS fails
          loadingElement.innerHTML = 'Trying alternative connection method...';
          
          // Create a cleanup function to remove the script
          const cleanup = (scriptElement) => {
              if (scriptElement && scriptElement.parentNode) {
                  scriptElement.parentNode.removeChild(scriptElement);
              }
          };
          
          // Try an alternative approach using a proxy or JSONP if available
          alert("We encountered an issue connecting to the routing service. Please try using a different browser or enable CORS in your browser settings.");
          mapContainer.removeChild(loadingElement);
      });
  }).catch(error => {
      console.error("Location search error:", error);
      alert("Could not find one or both locations. Please try more specific addresses.");
      if (mapContainer.contains(loadingElement)) {
          mapContainer.removeChild(loadingElement);
      }
  });
}

// Process the data returned from the API
function processRouteData(data, sourceLat, sourceLon, destLat, destLon, source, destination, chargeDifference, batteryCapacity, carModel, efficiency, loadingElement) {
  console.log("Route data received:", data);
  
  if (!data.route || !data.stations || data.stations.length === 0) {
      alert("No charging stations found along this route.");
      loadingElement.parentNode.removeChild(loadingElement);
      return;
  }

  // Clear existing markers and routes
  mapInstance.eachLayer(layer => {
      if (layer instanceof L.Marker || layer === routeLayer) {
          mapInstance.removeLayer(layer);
      }
  });

  // Make sure OpenStreetMap tiles are still present
  let tileLayerExists = false;
  mapInstance.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
          tileLayerExists = true;
      }
  });
  
  if (!tileLayerExists) {
      // Re-add the tile layer if it was removed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
      }).addTo(mapInstance);
  }

  // Create start and end icons
  let startIcon, endIcon;
  try {
      startIcon = L.icon({
          iconUrl: './icons/start.png',
          iconSize: [70, 70]
      });
  } catch (e) {
      console.warn("Start icon not found, using default marker");
      startIcon = new L.Icon.Default();
  }

  try {
      endIcon = L.icon({
          iconUrl: './icons/end.png',
          iconSize: [70, 70]
      });
  } catch (e) {
      console.warn("End icon not found, using default marker");
      endIcon = new L.Icon.Default();
  }

  // Add start marker
  startMarker = L.marker([sourceLat, sourceLon], { icon: startIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>Start Location</b><br>${source}`);

  // Add end marker
  endMarker = L.marker([destLat, destLon], { icon: endIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>Destination</b><br>${destination}`);

  // Create route line using the returned coordinates
  let routeCoordinates = data.route.map(coord => [coord[0], coord[1]]);
  routeLayer = L.polyline(routeCoordinates, { 
      color: '#2196F3', 
      weight: 4, 
      opacity: 0.7 
  }).addTo(mapInstance);

  // Add charging stations
  data.stations.forEach(station => {
      let lat = station.latitude;
      let lon = station.longitude;
      let distance = station.distance_km;
      
      // Get cost estimate
      const costApiUrl = `https://planyourjourney.onrender.com/api/estimate-charging-cost?chargeDifference=${chargeDifference}&batteryCapacity=${batteryCapacity}&lat=${lat}&lon=${lon}&carModel=${encodeURIComponent(carModel)}&efficiency=${efficiency}`;
      
      fetch(costApiUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin
          }
      })
      .then(res => {
          if (!res.ok) {
              throw new Error(`Cost API returned status: ${res.status}`);
          }
          return res.json();
      })
      .then(costData => {
          // Create popup content
          let popupContent = `
              <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0; color: #2196F3; font-size: 16px;">${costData.charging_station || "ElectriStay Charging Station"}</h3>
                  <p><strong>Operator:</strong> ${costData.operator || "ElectriStay"}</p>
                  <p><strong>Distance to Route:</strong> ${distance} km</p>
                  <p><strong>Energy Needed:</strong> ${costData.energy_needed_kwh} kWh</p>
                  <p><strong>Price per kWh:</strong> €${costData.price_per_kwh}</p>
                  <p><strong>Estimated Cost:</strong> <strong>€${costData.estimated_cost}</strong></p>
                  <button 
                      style="background-color: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;" 
                      onclick="alert('Charging station reserved!')">
                      Reserve Station
                  </button>
              </div>
          `;

          // Choose icon based on whether the station has a restaurant
          let iconUrl, icon;
          try {
              iconUrl = station.has_restaurant ? './icons/restaurant.png' : './icons/charging.png';
              icon = L.icon({ iconUrl: iconUrl, iconSize: [30, 30] });
          } catch (e) {
              console.warn("Charging icon not found, using default marker");
              icon = new L.Icon.Default();
          }

          // Add marker to map
          L.marker([lat, lon], { icon: icon })
              .addTo(mapInstance)
              .bindPopup(popupContent);
      })
      .catch(error => {
          console.error("Error fetching cost data:", error);
          
          // Add basic marker without cost data
          let basicPopupContent = `
              <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0; color: #2196F3; font-size: 16px;">ElectriStay Charging Station</h3>
                  <p><strong>Distance to Route:</strong> ${distance} km</p>
                  <button 
                      style="background-color: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;" 
                      onclick="alert('Charging station reserved!')">
                      Reserve Station
                  </button>
              </div>
          `;
          
          let iconUrl = station.has_restaurant ? './icons/restaurant.png' : './icons/charging.png';
          let icon;
          
          try {
              icon = L.icon({ iconUrl: iconUrl, iconSize: [30, 30] });
          } catch (e) {
              icon = new L.Icon.Default();
          }
          
          L.marker([lat, lon], { icon: icon })
              .addTo(mapInstance)
              .bindPopup(basicPopupContent);
      });
  });

  // Fit map to show the entire route
  mapInstance.fitBounds(routeLayer.getBounds());
  
  // Remove the loading indicator
  loadingElement.parentNode.removeChild(loadingElement);
}

// Make functions available globally
window.toggleConfiguration = toggleConfiguration;
window.fetchChargingStations = fetchChargingStations;