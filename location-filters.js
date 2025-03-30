// Enhanced filterProperties function with charging type filter
function filterProperties() {
    const searchInput = document.querySelector('.search-input').value.toLowerCase();
    const locationFilter = document.getElementById('location').value.toLowerCase();
    const propertyTypeFilter = document.getElementById('property-type').value.toLowerCase();
    const chargingTypeFilter = document.getElementById('charging-type').value.toLowerCase();
    const bedroomsFilter = document.getElementById('bedrooms').value;
    const priceRangeFilter = document.getElementById('price-range').value;
    const evChargingFilter = document.querySelector('.toggle-switch input').checked;
    
    // Debug information
    console.log('Filtering with:');
    console.log('- Charging Type:', chargingTypeFilter);
    
    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    propertyCards.forEach(card => {
        // Get all text content from the card for searching
        const cardText = card.textContent.toLowerCase();
        const propertyName = card.querySelector('.property-name').textContent.toLowerCase();
        const propertyLocation = card.querySelector('.property-location').textContent.toLowerCase();
        const hasEVCharging = card.querySelector('.ev-badge') !== null;
        
        // Get charging types from data attribute - with better fallback and trimming
        const chargingTypesAttr = card.getAttribute('data-charging-types') || '';
        const chargingTypes = chargingTypesAttr.toLowerCase().split(/\s+/).filter(type => type.length > 0);
        
        // Get EV badge text for more flexible matching
        const evBadgeText = card.querySelector('.ev-badge') ? 
                            card.querySelector('.ev-badge').textContent.toLowerCase() : '';
        
        // Debug information for all properties
        console.log(`Property: ${propertyName}, Charging Types:`, chargingTypes);
        
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
        
        // Filter by charging type with more flexible matching
        if (chargingTypeFilter) {
            // Check both data attribute and visible text for matching
            const matchInData = chargingTypes.some(type => type.includes(chargingTypeFilter) || 
                                                chargingTypeFilter.includes(type));
            const matchInText = evBadgeText.includes(chargingTypeFilter);
            
            // Special case for "solar" filter
            const isSolarFilter = chargingTypeFilter === 'solar';
            const hasSolarText = evBadgeText.includes('solar');
            
            if (!(matchInData || matchInText || (isSolarFilter && hasSolarText))) {
                showProperty = false;
            }
        }
        
        // Filter by EV charging if enabled
        if (evChargingFilter && !hasEVCharging) {
            showProperty = false;
        }
        
        // Show or hide the property based on filter results
        card.style.display = showProperty ? 'block' : 'none';
        
        if (showProperty) {
            visibleCount++;
        }
    });
    
    // Show message if no results
    const noResultsMessage = document.getElementById('no-results-message');
    
    if (visibleCount === 0) {
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.style.textAlign = 'center';
            message.style.padding = '2rem';
            message.style.color = '#999';
            message.innerHTML = 'No properties match your selected filters. <br>Try adjusting your filters to see more options.';
            
            const listingsSection = document.querySelector('.listings-section');
            listingsSection.appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Make sure the event listeners are properly set up
document.addEventListener('DOMContentLoaded', function() {
    // Check if data attributes exist on property cards, add them if missing
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        // If card doesn't have data-charging-types attribute, try to extract it from the content
        if (!card.hasAttribute('data-charging-types')) {
            const evBadgeText = card.querySelector('.ev-badge')?.textContent.toLowerCase() || '';
            let chargingTypes = [];
            
            if (evBadgeText.includes('tesla')) chargingTypes.push('tesla');
            if (evBadgeText.includes('universal')) chargingTypes.push('universal');
            if (evBadgeText.includes('solar')) chargingTypes.push('solar');
            if (evBadgeText.includes('fast')) chargingTypes.push('fast');
            if (evBadgeText.includes('level 2')) chargingTypes.push('level2');
            if (evBadgeText.includes('24-hour') || evBadgeText.includes('24 hour')) chargingTypes.push('24hour');
            
            // Set the data attribute if we found any charging types
            if (chargingTypes.length > 0) {
                card.setAttribute('data-charging-types', chargingTypes.join(' '));
            }
        }
    });
    
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
    
    // Specifically ensure the charging type filter has an event listener
    const chargingTypeFilter = document.getElementById('charging-type');
    if (chargingTypeFilter) {
        chargingTypeFilter.addEventListener('change', filterProperties);
        console.log('Charging type filter event listener added');
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