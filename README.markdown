# Highway Trip Planner

![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github) [View on GitHub](https://github.com/yaseen454/HighwayTripPlanner)

## Overview

Highway Trip Planner is a web application designed to help users estimate fuel costs for highway trips, accounting for speed-adjusted fuel efficiency. It provides detailed calculations for vehicle profiles, single trips, and long-term travel plans, including monthly subscriptions and per-trip expenses. Built with HTML, JavaScript, and Tailwind CSS, it offers a responsive and user-friendly interface. The app is deployed live at [https://highwayplan.netlify.app/](https://highwayplan.netlify.app/).

## Features

- **Vehicle Profile**: Input fuel price, tank capacity, and fuel efficiency (km/L) to calculate tank cost and average range.
- **Single Trip Calculator**: Estimate fuel requirements and costs for a specific trip distance and average speed.
- **Long-Term Planning**: Plan recurring trips over months, including weekly trip frequency, subscriptions (e.g., parking, mobile data), and per-trip expenses (e.g., snacks).
- **Speed-Adjusted Efficiency**: Adjusts fuel efficiency based on average highway speed (50–120 km/h) using a quadratic efficiency drop model.
- **Dynamic Inputs**: Add or remove subscription and expense entries dynamically.
- **Responsive Design**: Optimized for desktop and mobile devices with Tailwind CSS and a clean, modern UI.
- **Tab-Based Results**: View results for vehicle profile, single trip, or long-term plan in separate tabs with a smooth fade-in animation.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yaseen454/HighwayTripPlanner.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd HighwayTripPlanner
   ```
3. **Open the Application**:
   - Open `index.html` in a web browser (e.g., Chrome, Firefox).
   - No additional server setup is required as the app uses client-side JavaScript and CDN-hosted dependencies (Tailwind CSS, Google Fonts).
   - Alternatively, visit Babel

   visit the live app at [https://highwayplan.netlify.app/](https://highwayplan.netlify.app/).

## Usage

1. **Vehicle Profile**:
   - Enter the fuel price (EGP/L), tank capacity (L), and fuel efficiency (comma-separated km/L values for averaging).
   - Example: Fuel Price: `17.25`, Tank Capacity: `37`, Fuel Efficiency: `15,15.5,15.8,15.9,16`.

2. **Average Highway Speed**:
   - Adjust the speed slider (50–120 km/h) to account for efficiency changes. Default is 80 km/h (optimal speed).

3. **Single Trip**:
   - Input the trip distance (km) to calculate fuel needed and cost based on the adjusted efficiency.

4. **Long-Term Plan**:
   - Specify distance per trip (km), duration (months), and trips per week.
   - Add monthly subscriptions (e.g., Parking: `550` EGP) and per-trip expenses (e.g., Snacks: `20` EGP) using the "Add" buttons.
   - Remove entries with the red "X" button.

5. **View Results**:
   - Click the "Calculate" button to update results.
   - Switch between tabs (Vehicle Profile, Single Trip, Long-Term Plan) to view detailed outputs.
   - Results include formatted values with units (e.g., km, L, EGP) and handle edge cases with error messages.

## Technologies Used

- **HTML5**: Structure of the web application.
- **JavaScript (ES6)**: Core logic for calculations, dynamic input handling, and DOM manipulation.
- **Tailwind CSS**: Responsive styling with utility-first classes.
- **Google Fonts (Inter)**: Clean and modern typography.
- **SVG Icons**: Lightweight icons for UI elements (e.g., add/remove buttons).

## Project Structure

```
HighwayTripPlanner/
├── index.html        # Main HTML file
├── script.js         # JavaScript logic for calculations and interactivity
├── style.css         # Custom CSS to complement Tailwind
├── data/             # Favicon and manifest files
│   ├── apple-touch-icon.png
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   ├── site.webmanifest
└── README.md         # Project documentation
```

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure code follows the existing style and includes relevant tests or documentation updates.
