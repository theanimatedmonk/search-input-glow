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

// Voice Recognition Setup
let recognition = null;
let isListening = false;

function initVoiceRecognition() {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            isListening = true;
            showVoiceOverlay();
            updateVoiceStatus('Speak now', true);
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            updateVoiceStatus('Got it!', false);
            
            // Open Google search in a new tab
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(transcript)}`;
            window.open(searchUrl, '_blank');
            
            setTimeout(() => {
                hideVoiceOverlay();
            }, 500);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            updateVoiceStatus('Try again', false);
            setTimeout(() => {
                hideVoiceOverlay();
            }, 1500);
        };
        
        recognition.onend = () => {
            isListening = false;
            if (document.getElementById('voice-search-overlay').classList.contains('active')) {
                setTimeout(() => {
                    hideVoiceOverlay();
                }, 500);
            }
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
}

// Initialize voice recognition when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initVoiceRecognition();
        setupMicClickListener();
    });
} else {
    initVoiceRecognition();
    setupMicClickListener();
}

function showVoiceOverlay() {
    const overlay = document.getElementById('voice-search-overlay');
    const micButton = document.getElementById('voice-mic-button');
    const waves = document.querySelector('.voice-waves');
    if (overlay) {
        overlay.classList.add('active');
        if (micButton) micButton.classList.add('listening');
        if (waves) waves.classList.add('active');
    }
}

function hideVoiceOverlay() {
    const overlay = document.getElementById('voice-search-overlay');
    const micButton = document.getElementById('voice-mic-button');
    const waves = document.querySelector('.voice-waves');
    if (overlay) {
        overlay.classList.remove('active');
        if (micButton) micButton.classList.remove('listening');
        if (waves) waves.classList.remove('active');
    }
}

function updateVoiceStatus(text, listening) {
    const statusText = document.getElementById('voice-status-text');
    if (statusText) {
        statusText.textContent = text;
        if (listening) {
            statusText.classList.add('listening');
        } else {
            statusText.classList.remove('listening');
        }
    }
}

function setupMicClickListener() {
    const micIcon = document.getElementById('mic-icon');
    const voiceMicButton = document.getElementById('voice-mic-button');
    
    if (micIcon && recognition) {
        micIcon.style.cursor = 'pointer';
        micIcon.addEventListener('click', () => {
            if (!isListening) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error starting recognition:', error);
                }
            } else {
                recognition.stop();
            }
        });
    } else if (micIcon && !recognition) {
        micIcon.style.cursor = 'not-allowed';
        micIcon.style.opacity = '0.5';
    }
    
    // Also allow clicking the large mic button in overlay to stop
    if (voiceMicButton && recognition) {
        voiceMicButton.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            }
        });
    }
    
    // Close overlay when clicking outside
    const overlay = document.getElementById('voice-search-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (isListening) {
                    recognition.stop();
                }
                hideVoiceOverlay();
            }
        });
    }
}

// Toggle between mic and clear icon based on input value
function toggleSearchIcons() {
    const searchInput = document.getElementById('search-input');
    const micIcon = document.getElementById('mic-icon');
    const clearIcon = document.getElementById('clear-icon');
    
    if (searchInput && micIcon && clearIcon) {
        if (searchInput.value.length > 0) {
            micIcon.style.display = 'none';
            clearIcon.style.display = 'block';
        } else {
            micIcon.style.display = 'block';
            clearIcon.style.display = 'none';
        }
    }
}

// Clear search input
function clearSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        toggleSearchIcons();
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim().length > 0) {
        const searchQuery = searchInput.value.trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(searchUrl, '_blank');
    }
}

// Initialize search input handlers
function initSearchInputHandlers() {
    const searchInput = document.getElementById('search-input');
    const clearIcon = document.getElementById('clear-icon');
    
    if (searchInput) {
        // Toggle icons on input
        searchInput.addEventListener('input', toggleSearchIcons);
        
        // Handle Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    if (clearIcon) {
        clearIcon.style.cursor = 'pointer';
        clearIcon.addEventListener('click', clearSearchInput);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchInputHandlers);
} else {
    initSearchInputHandlers();
}

