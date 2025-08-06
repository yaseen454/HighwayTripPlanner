# VTrip - Vehicle Trip Calculator

## Overview

**VTrip** is a versatile web application designed to help users estimate the total costs associated with their vehicle trips. Moving beyond simple fuel calculations, VTrip accounts for speed-adjusted fuel efficiency, long-term travel plans, recurring monthly subscriptions, and per-trip expenses. It also offers a unique feature to analyze the financial impact of these costs by calculating the required monthly income for trip expenses to represent a certain percentage of the user's budget.

Built with modern web technologies like HTML, JavaScript, and Tailwind CSS, it offers a responsive, intuitive, and user-friendly interface for comprehensive trip planning.

## Features

-   **Vehicle Profile**: Input fuel price, tank capacity, and average fuel efficiency (km/L) to establish a baseline for your vehicle's running costs.
-   **Single Trip Calculator**: Estimate fuel requirements and costs for a specific trip distance based on your average travel speed.
-   **Long-Term Planning**: Plan recurring trips over several months, factoring in weekly frequency, monthly subscriptions (e.g., parking, mobile data), and per-trip expenses (e.g., snacks).
-   **Speed-Adjusted Efficiency**: The calculator intelligently adjusts your vehicle's fuel efficiency based on the provided average speed, using a quadratic efficiency drop model to simulate real-world conditions.
-   **Income-Based Cost Analysis**: Determine the required monthly income for your travel costs to match a specified percentage of your total earnings, helping with budgeting.
-   **Dynamic Inputs**: Easily add or remove subscription and expense entries on the fly.
-   **Responsive Design**: A clean, modern UI optimized for both desktop and mobile devices using Tailwind CSS.
-   **Tab-Based Results**: Clearly view detailed results for your vehicle profile, a single trip, or a long-term plan in organized, easy-to-navigate tabs.

## Installation

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/yaseen454/VTrip](https://github.com/yaseen454/VTrip)
    ```
2.  **Navigate to the Project Directory**:
    ```bash
    cd HighwayTripPlanner 
    ```
    *(Note: The repository name might still be the original one unless changed on GitHub)*

3.  **Open the Application**:
    -   Open `index.html` in any modern web browser (e.g., Chrome, Firefox, Safari).
    -   No server setup is needed, as the application runs entirely on the client-side.

## Usage

1.  **Vehicle Profile**:
    -   Enter your local fuel price, your vehicle's tank capacity, and its average fuel efficiency. You can enter comma-separated values for efficiency to get an average.
    -   Example: Fuel Price: `17.25`, Tank Capacity: `37`, Fuel Efficiency: `15,15.5,15.8,15.9,16`.

2.  **Average Speed**:
    -   Adjust the speed slider to match your typical average speed for a trip. This will directly impact the efficiency calculation.

3.  **Single Trip**:
    -   Input the trip distance (km) to calculate the fuel needed and cost for a one-off journey.

4.  **Long-Term Plan**:
    -   Specify the distance per trip, the duration of your plan in months, and how many trips you take per week.
    -   **Set Income Percentage**: Enter the percentage of your monthly income you want your trip costs to represent (e.g., 10%).
    -   Add any recurring monthly subscriptions (e.g., Parking: `550` EGP) and per-trip expenses (e.g., Snacks: `20` EGP).

5.  **View Results**:
    -   Click the "Calculate" button (or simply change any input) to see the updated results.
    -   Switch between the "Vehicle Profile," "Single Trip," and "Long-Term Plan" tabs to view all the detailed outputs, including the highlighted total costs and required income.

## Technologies Used

-   **HTML5**: For the structure of the web application.
-   **JavaScript (ES6)**: For the core calculation logic, dynamic elements, and interactivity.
-   **Tailwind CSS**: For the responsive, utility-first styling framework.
-   **Google Fonts (Inter)**: For clean and modern typography.
-   **SVG Icons**: For lightweight and scalable UI elements.

## Project Structure

```
VTrip/
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

Contributions are welcome! If you'd like to improve VTrip:
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add your feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a pull request with a clear description of your changes.
