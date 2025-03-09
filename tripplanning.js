  document.addEventListener('DOMContentLoaded', function() {
    // Ensure the map only initializes when the trip-planning section is visible
    const tripPlanningSection = document.getElementById('trip-planning');
    const mapContainer = document.getElementById('simple-map');

    if (tripPlanningSection && mapContainer) {
      // Initialize Leaflet map
      var map = L.map('simple-map').setView([46.8182, 8.2275], 7);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add a marker (Switzerland as an example)
      L.marker([46.8182, 8.2275]).addTo(map)
        .bindPopup('ElectriStay Charging Station')
        .openPopup();

      // Ensure the map resizes properly when displayed
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }
  });
