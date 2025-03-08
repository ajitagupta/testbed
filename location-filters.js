// Replace the existing filterProperties function with this improved version
function filterProperties() {
    const searchInput = document.querySelector('.search-input').value.toLowerCase();
    const locationFilter = document.getElementById('location').value.toLowerCase();
    const propertyTypeFilter = document.getElementById('property-type').value.toLowerCase();
    const bedroomsFilter = document.getElementById('bedrooms').value;
    const priceRangeFilter = document.getElementById('price-range').value;
    const evChargingFilter = document.querySelector('.toggle-switch input').checked;
    
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        // Get all text content from the card for searching
        const cardText = card.textContent.toLowerCase();
        const propertyName = card.querySelector('.property-name').textContent.toLowerCase();
        const propertyLocation = card.querySelector('.property-location').textContent.toLowerCase();
        const hasEVCharging = card.querySelector('.ev-badge') !== null;
        
        // Initialize show flag as true (will hide if any filter doesn't match)
        let showProperty = true;
        
        // Filter by search text - check if any part of the card contains the search text
        if (searchInput && !cardText.includes(searchInput)) {
            showProperty = false;
        }
        
        // Filter by location if selected
        if (locationFilter && !propertyLocation.includes(locationFilter)) {
            showProperty = false;
        }
        
        // Filter by property type if selected
        // This assumes property type info is somewhere in the card text
        if (propertyTypeFilter && !cardText.includes(propertyTypeFilter)) {
            showProperty = false;
        }
        
        // Filter by EV charging if enabled
        if (evChargingFilter && !hasEVCharging) {
            showProperty = false;
        }
        
        // Price filtering could be implemented here with price parsing
        // Bedrooms filtering could be implemented here
        
        // Show or hide the property based on filter results
        card.style.display = showProperty ? 'block' : 'none';
    });
}

// Make sure the event listeners are properly set up
document.addEventListener('DOMContentLoaded', function() {
    // Add search input event listener
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterProperties);
    }
    
    // Add event listeners to all filter dropdowns
    const filterSelects = document.querySelectorAll('.filter-select');
    if (filterSelects) {
        filterSelects.forEach(select => {
            select.addEventListener('change', filterProperties);
        });
    }
    
    // Add event listener to EV charging toggle
    const evToggle = document.querySelector('.toggle-switch input');
    if (evToggle) {
        evToggle.addEventListener('change', filterProperties);
    }
    
    // Reset filters button functionality
    const resetButton = document.querySelector('.reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset all select inputs
            document.querySelectorAll('.filter-select').forEach(select => {
                select.selectedIndex = 0;
            });
            
            // Reset search input
            document.querySelector('.search-input').value = '';
            
            // Keep EV toggle checked as default
            document.querySelector('.toggle-switch input').checked = true;
            
            // Re-filter properties with reset values
            filterProperties();
        });
    }
});