Year Progress Tracker
A modern, high-performance web application that visualizes the progression of the current year in real time.
Designed with precision, performance, and polish in mind, the Year Progress Tracker combines accurate time calculations, seasonal logic, progressive enhancement, and a refined user interface.
This project is built as a portfolio-grade product, not a demo.
Overview
The Year Progress Tracker provides a real-time visualization of how much of the current year has elapsed. It continuously updates the current date, time, year progress percentage, remaining days, and seasonal context based on hemisphere selection.
The application emphasizes:
Accuracy in date and leap-year calculations
Smooth, performance-aware animations
Accessibility and system preference awareness
A clean, modern UI with dark and light themes
Progressive Web App (PWA) readiness
Features
Real-time date and time display
Precise year progress calculation with leap-year support
Animated progress bar with throttled updates
Day-of-year and remaining days breakdown
Hemisphere-aware seasonal detection (Northern and Southern)
Dark and light theme support with persistent user preference
System theme and reduced-motion awareness
Sophisticated animated background system with performance safeguards
Progressive Web App support (manifest and service worker ready)

Technology Stack

HTML5 (semantic structure)
CSS3 (custom properties, animations, dark mode)
Vanilla JavaScript (ES6+)
Font Awesome for icons
Google Fonts (Inter, JetBrains Mono)

No frameworks. No dependencies. No unnecessary abstraction.
Architecture Highlights
Modular JavaScript design with clear separation of concerns
Centralized configuration object for maintainability
Performance throttling for animations and DOM updates
Theme management with localStorage persistence
Accessibility considerations (reduced motion, system preferences)
Clean initialization and cleanup lifecycle
Dark Mode Implementation

Dark mode is implemented using a data-attribute approach:
Theme state is stored in localStorage
Automatically respects system preferences on first load
Manual toggle via UI (light bulb, pull chain, switch)
Background effects dynamically adapt to the active theme

Progressive Web App (PWA)
The project includes:
Web App Manifest
Theme color metadata
Service worker registration (HTTPS or localhost only)
This allows the app to be installable and future-ready for offline enhancements.

Usage
Clone the repository:
git clone https://github.com/codedbytim-22/Year-Progress-Tracker.git
Open index.html in a modern browser.
No build step required.

Intended Use
This project is intended for:
Portfolio demonstration
Technical evaluation
Client or recruiter review
It is not released as open-source software

License

© 2026 Tim (codedbytim-22). All Rights Reserved.

This project is proprietary software.

You may view the source code for evaluation purposes only.
You may not copy, modify, distribute, sublicense, or use this project commercially without explicit written permission from the author.

Author

Tim
Frontend Developer and Product-Focused Engineer

