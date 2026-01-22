# Search Input Glow

A modern, animated search interface with a beautiful glowing border effect powered by Rive animations.

## Features

- **Animated Glow Effect**: The search input features a dynamic, glowing border animation created using [Rive](https://rive.app/)
- **Responsive Design**: Fully responsive layout that adapts to different screen sizes
- **Recent Searches**: Displays a list of recent search queries with clickable links
- **Smooth Interactions**: Opacity transitions when the input is focused or blurred
- **Modern UI**: Clean, minimalist design with Inter font

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling and responsive design
- **JavaScript** - Interactive functionality
- **Rive** - Used for creating the animated glow effect around the search input. Rive is a powerful tool for creating interactive animations that run smoothly across all devices.

## Rive Animation

The glow effect around the search input is created using a Rive animation file (`search_bar.riv`). Rive allows for:
- Smooth, hardware-accelerated animations
- Responsive layouts that adapt to different screen sizes
- Data binding for dynamic behavior (mobile/desktop states)
- High performance with WebGL rendering

The animation uses a state machine named "search bar" and includes responsive behavior that adjusts padding and appearance based on screen size.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/theanimatedmonk/search-input-glow.git
```

2. Open `index.html` in your web browser

3. No build process required - it's ready to use!

## File Structure

```
search-input-glow/
├── assets/
│   ├── search_bar.riv      # Rive animation file for glow effect
│   ├── internet.svg         # Globe icon
│   ├── search.svg           # Search icon
│   ├── mic.svg              # Microphone icon
│   ├── recent.svg           # Recent searches icon
│   └── arrow.svg            # Arrow icon
├── index.html               # Main HTML file
├── styles.css               # Stylesheet
├── script.js                # JavaScript functionality
└── README.md                # This file
```

## Browser Support

Works on all modern browsers that support:
- WebGL (for Rive animations)
- ES6+ JavaScript
- CSS Grid and Flexbox

## License

This project is open source and available for use.

