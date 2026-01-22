// Dummy Recent Searches Data
const recentSearchesData = [
    { query: 'best restaurants near me', link: 'https://www.google.com/search?q=best+restaurants+near+me' },
    { query: 'how to learn JavaScript', link: 'https://www.google.com/search?q=how+to+learn+JavaScript' },
    { query: 'weather forecast this week', link: 'https://www.google.com/search?q=weather+forecast+this+week' },
    { query: 'python tutorial for beginners', link: 'https://www.google.com/search?q=python+tutorial+for+beginners' },
    { query: 'coffee shops open now', link: 'https://www.google.com/search?q=coffee+shops+open+now' }
];

// Rive Animation Setup for Search Bar - Glow Effect Only
let riveInstance = null;
let mobileProperty = null;
let previousMobileValue = null;

function updateMobileProperty() {
    if (mobileProperty) {
        const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
        const previousValue = previousMobileValue !== null ? previousMobileValue : mobileProperty.value;
        mobileProperty.value = isMobile;
        previousMobileValue = isMobile;
    }
}

function computeSize() {
    if (riveInstance) {
        // Get search-input-wrapper dimensions
        const searchInputWrapper = document.querySelector('.search-input-wrapper');
        if (searchInputWrapper && riveInstance) {
            const rect = searchInputWrapper.getBoundingClientRect();
            
            // Use different padding for mobile vs desktop
            const isMobile = window.innerWidth <= 768;
            const horizontalPadding = isMobile ? 32 : 80; // Left and right
            const verticalPadding = 80; // Top and bottom (always 80)
            
            // Calculate canvas size: wrapper size + padding on all sides
            const canvasWidth = rect.width + (horizontalPadding * 2);
            const canvasHeight = rect.height + (verticalPadding * 2);
            
            const canvas = document.getElementById('search-bar-rive');
            if (canvas) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                canvas.style.width = canvasWidth + 'px';
                canvas.style.height = canvasHeight + 'px';
            }
        }
        riveInstance.resizeDrawingSurfaceToCanvas();
    }
}

function initRive() {
    // Wait for Rive library to be available
    if (typeof rive === 'undefined') {
        return;
    }

    // Get the canvas element
    const canvas = document.getElementById('search-bar-rive');
    
    if (!canvas) {
        return;
    }

    // Initialize Rive
    riveInstance = new rive.Rive({
        src: 'assets/search_bar.riv',
        canvas: canvas,
        autoplay: true,
        stateMachines: 'search bar',
        autoBind: false, // Bind manually for data binding
        layout: new rive.Layout({
            fit: rive.Fit.Layout,
            // layoutScaleFactor: 1, // Optional: scale factor for fine-tuning
        }),
        onLoad: () => {
            // Access view model for data binding
            try {
                const vm = riveInstance.viewModelByName('SearchBarResponsiveness');
                
                if (vm) {
                    const vmi = vm.instanceByName('Instance');
                    
                    if (vmi) {
                        // Bind to the runtime
                        riveInstance.bindViewModelInstance(vmi);
                        
                        // Get the mobile boolean property
                        mobileProperty = vmi.boolean('mobile');
                        
                        if (mobileProperty) {
                            // Set initial value based on screen size
                            updateMobileProperty();
                        }
                    }
                }
            } catch (error) {
                // Silently handle errors
            }
            
            computeSize();
            
            // Watch for changes in search-input-wrapper size
            const searchInputWrapper = document.querySelector('.search-input-wrapper');
            if (searchInputWrapper && window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    computeSize();
                });
                resizeObserver.observe(searchInputWrapper);
            }
            
            // Set canvas opacity based on input focus state
            const searchInput = document.querySelector('.search-input');
            if (searchInput && canvas) {
                searchInput.addEventListener('focus', () => {
                    canvas.style.opacity = '0.1';
                });
                
                searchInput.addEventListener('blur', () => {
                    canvas.style.opacity = '0.5';
                });
            }
        },
        onLoadError: (error) => {
            // Silently handle load errors
        },
    });

    // Subscribe to window size changes and update call `resizeDrawingSurfaceToCanvas`
    window.onresize = () => {
        updateMobileProperty();
        computeSize();
    };

    // Subscribe to devicePixelRatio changes and call `resizeDrawingSurfaceToCanvas`
    window
        .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
        .addEventListener('change', computeSize);
}

// Initialize Rive when both DOM and Rive library are ready
function waitForRive() {
    if (typeof rive !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initRive);
        } else {
            initRive();
        }
    } else {
        setTimeout(waitForRive, 50);
    }
}

waitForRive();

// Render Recent Searches
function renderRecentSearches() {
    const recentSearchesList = document.querySelector('.recent-searches-list');
    if (!recentSearchesList) return;

    // Clear existing items
    recentSearchesList.innerHTML = '';

    // Render each search item
    recentSearchesData.forEach((search) => {
        const item = document.createElement('a');
        item.className = 'recent-search-item';
        item.href = search.link;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        
        item.innerHTML = `
            <img src="assets/recent.svg" alt="search icon" style="margin-right: 8px;" >
            <span class="search-query">${search.query}</span>
            <img src="assets/arrow.svg" alt="arrow icon" >
        `;
        
        recentSearchesList.appendChild(item);
    });
}

// Initialize Recent Searches when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRecentSearches);
} else {
    renderRecentSearches();
}

