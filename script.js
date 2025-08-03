document.addEventListener('DOMContentLoaded', () => {
    // --- CLASS DEFINITION ---
    class FuelCalculator {
        static WEEKS_PER_MONTH = 4.345;
        static DAYS_PER_WEEK = 7;
        static OPTIMAL_SPEED_KMH = 80;
        static EFFICIENCY_DROP_FACTOR = 0.00005;

        constructor(fuelPricePerLiter, maxFuelTankLiters, fuelEfficiencyKmPerL) {
            if (!fuelPricePerLiter || !maxFuelTankLiters || fuelPricePerLiter <= 0 || maxFuelTankLiters <= 0) {
                throw new Error("Fuel price and tank capacity must be positive numbers.");
            }
            this.fuelPricePerLiter = parseFloat(fuelPricePerLiter);
            this.maxFuelTankLiters = parseFloat(maxFuelTankLiters);
            this.avgEfficiencyKmL = Array.isArray(fuelEfficiencyKmPerL) && fuelEfficiencyKmPerL.length > 0
                ? fuelEfficiencyKmPerL.reduce((sum, val) => sum + parseFloat(val), 0) / fuelEfficiencyKmPerL.length
                : parseFloat(fuelEfficiencyKmPerL);
            if (isNaN(this.avgEfficiencyKmL) || this.avgEfficiencyKmL <= 0) {
                throw new Error("Fuel efficiency must be a positive number.");
            }
            this.efficiencyL100km = (1 / this.avgEfficiencyKmL) * 100;
            this.maxFuelTankPrice = this.fuelPricePerLiter * this.maxFuelTankLiters;
            this.avgTheoreticalRangeKm = this.maxFuelTankLiters * this.avgEfficiencyKmL;
        }

        getSpeedAdjustedEfficiency(speedKmh) {
            if (isNaN(speedKmh) || speedKmh < 50 || speedKmh > 120) {
                throw new Error("Speed must be between 50 and 120 km/h.");
            }
            const deltaSpeed = speedKmh - FuelCalculator.OPTIMAL_SPEED_KMH;
            const efficiencyFactor = 1 - FuelCalculator.EFFICIENCY_DROP_FACTOR * (deltaSpeed ** 2);
            return this.avgEfficiencyKmL * Math.max(efficiencyFactor, 0.5);
        }

        getVehicleProfile() {
            return {
                "Fuel Price": { value: this.fuelPricePerLiter, unit: "EGP/L" },
                "Tank Capacity": { value: this.maxFuelTankLiters, unit: "L" },
                "Cost to Fill Tank": { value: this.maxFuelTankPrice, unit: "EGP" },
                "Avg. Efficiency": { value: this.avgEfficiencyKmL, unit: `km/L at ${FuelCalculator.OPTIMAL_SPEED_KMH} km/h` },
                "Avg. Range": { value: this.avgTheoreticalRangeKm, unit: "km" },
            };
        }

        calculateSingleTrip(totalDistanceKm, averageSpeedKmh = FuelCalculator.OPTIMAL_SPEED_KMH) {
            if (isNaN(totalDistanceKm) || totalDistanceKm < 0) {
                throw new Error("Distance must be a non-negative number.");
            }
            const adjustedEfficiency = this.getSpeedAdjustedEfficiency(averageSpeedKmh);
            const litersNeeded = totalDistanceKm / adjustedEfficiency;
            const tripCost = litersNeeded * this.fuelPricePerLiter;
            return {
                "Trip Distance": { value: totalDistanceKm, unit: "km" },
                "Average Speed": { value: averageSpeedKmh, unit: "km/h" },
                "Adjusted Efficiency": { value: adjustedEfficiency, unit: "km/L" },
                "Fuel Required": { value: litersNeeded, unit: "L" },
                "Estimated Cost": { value: tripCost, unit: "EGP" },
            };
        }

        planLongTermTrips(distancePerTripKm, durationMonths, tripsPerWeek, averageSpeedKmh = FuelCalculator.OPTIMAL_SPEED_KMH, monthlySubscriptions = {}, expensesPerTrip = {}) {
            if ([distancePerTripKm, durationMonths, tripsPerWeek].some(arg => isNaN(arg) || arg < 0)) {
                throw new Error("Distance, duration, and trips per week must be non-negative numbers.");
            }
            const adjustedEfficiency = this.getSpeedAdjustedEfficiency(averageSpeedKmh);
            const totalWeeks = durationMonths * FuelCalculator.WEEKS_PER_MONTH;
            const totalTrips = totalWeeks * tripsPerWeek;
            const totalDistancePlanned = distancePerTripKm * totalTrips;
            const totalLitersNeeded = totalDistancePlanned / adjustedEfficiency;
            const totalFuelCost = totalLitersNeeded * this.fuelPricePerLiter;
            let totalSubscriptionCost = 0;
            for (const cost of Object.values(monthlySubscriptions)) {
                totalSubscriptionCost += parseFloat(cost) * durationMonths;
            }
            let totalTripExpenseCost = 0;
            for (const cost of Object.values(expensesPerTrip)) {
                totalTripExpenseCost += parseFloat(cost) * totalTrips;
            }
            const grandTotalCost = totalFuelCost + totalSubscriptionCost + totalTripExpenseCost;
            return {
                "Planning Period": { value: durationMonths, unit: "months" },
                "Total Trips": { value: totalTrips, unit: "trips" },
                "Total Distance": { value: totalDistancePlanned, unit: "km" },
                "Total Fuel Needed": { value: totalLitersNeeded, unit: "L" },
                "Total Fuel Cost": { value: totalFuelCost, unit: "EGP" },
                "Total Subscription Cost": { value: totalSubscriptionCost, unit: "EGP" },
                "Total Per-Trip Expenses": { value: totalTripExpenseCost, unit: "EGP" },
                "Grand Total Cost": { value: grandTotalCost, unit: "EGP" },
                "Avg. Monthly Cost": { value: durationMonths > 0 ? grandTotalCost / durationMonths : 0, unit: "EGP" },
            };
        }
    }

    // --- DOM ELEMENTS ---
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const calculateBtn = document.getElementById('calculateBtn');
    const vehicleOutput = document.getElementById('vehicleOutput');
    const singleOutput = document.getElementById('singleOutput');
    const longtermOutput = document.getElementById('longtermOutput');
    const errorOutput = document.getElementById('errorOutput');
    const errorText = errorOutput.querySelector('p');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const subscriptionsContainer = document.getElementById('subscriptionsContainer');
    const addSubscriptionBtn = document.getElementById('addSubscription');
    const tripExpensesContainer = document.getElementById('tripExpensesContainer');
    const addTripExpenseBtn = document.getElementById('addTripExpense');

    // --- HELPER FUNCTIONS ---
    const parseInputList = (input) => input ? input.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val)) : [];

    const createInputRow = (type, name = '', cost = '') => {
        const div = document.createElement('div');
        div.className = 'flex space-x-2 items-center';
        div.innerHTML = `
            <input type="text" placeholder="${type} name" value="${name}" class="input-field w-1/2" data-type="${type}-name">
            <input type="number" placeholder="Cost" value="${cost}" step="0.01" min="0" class="input-field w-1/2" data-type="${type}-cost">
            <button class="remove-btn text-red-600 hover:text-red-700" title="Remove">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            calculate();
        });
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculate);
        });
        return div;
    };

    const parseKeyValueInputs = (container) => {
        const result = {};
        container.querySelectorAll('.flex').forEach(row => {
            const name = row.querySelector('[data-type$="-name"]').value.trim();
            const cost = parseFloat(row.querySelector('[data-type$="-cost"]').value);
            if (name && !isNaN(cost)) {
                result[name] = cost;
            }
        });
        return result;
    };

    const formatOutput = (data) => {
        let html = '';
        for (const [label, { value, unit }] of Object.entries(data)) {
            const formattedValue = Number.isFinite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
            html += `
                <div class="output-item">
                    <div class="label">${label}</div>
                    <div class="value">${formattedValue} <span class="unit">${unit}</span></div>
                </div>`;
        }
        return html;
    };

    const showError = (message) => {
        errorText.textContent = `Error: ${message}`;
        errorOutput.classList.remove('hidden');
        vehicleOutput.innerHTML = '';
        singleOutput.innerHTML = '';
        longtermOutput.innerHTML = '';
    };

    const hideError = () => {
        errorOutput.classList.add('hidden');
    };

    // --- MAIN CALCULATION LOGIC ---
    function calculate() {
        hideError();
        try {
            // Read all input values
            const fuelPrice = parseFloat(document.getElementById('fuelPrice').value);
            const tankCapacity = parseFloat(document.getElementById('tankCapacity').value);
            const fuelEfficiency = parseInputList(document.getElementById('fuelEfficiency').value);
            const singleTripDistance = parseFloat(document.getElementById('singleTripDistance').value);
            const longTermDistance = parseFloat(document.getElementById('longTermDistance').value);
            const durationMonths = parseInt(document.getElementById('durationMonths').value, 10);
            const tripsPerWeek = parseInt(document.getElementById('tripsPerWeek').value, 10);
            const subscriptions = parseKeyValueInputs(subscriptionsContainer);
            const tripExpenses = parseKeyValueInputs(tripExpensesContainer);
            const averageSpeed = parseFloat(speedSlider.value);

            // Validate required fields
            if (isNaN(fuelPrice) || isNaN(tankCapacity) || fuelEfficiency.length === 0) {
                throw new Error("Please fill all vehicle profile fields with valid numbers.");
            }

            const calculator = new FuelCalculator(fuelPrice, tankCapacity, fuelEfficiency);

            // Generate and display reports
            const profile = calculator.getVehicleProfile();
            vehicleOutput.innerHTML = formatOutput(profile);

            if (!isNaN(singleTripDistance)) {
                const singleTrip = calculator.calculateSingleTrip(singleTripDistance, averageSpeed);
                singleOutput.innerHTML = formatOutput(singleTrip);
            } else {
                singleOutput.innerHTML = '<p class="text-gray-500">Enter a distance to calculate.</p>';
            }

            if (!isNaN(longTermDistance) && !isNaN(durationMonths) && !isNaN(tripsPerWeek)) {
                const longTermPlan = calculator.planLongTermTrips(longTermDistance, durationMonths, tripsPerWeek, averageSpeed, subscriptions, tripExpenses);
                longtermOutput.innerHTML = formatOutput(longTermPlan);
            } else {
                longtermOutput.innerHTML = '<p class="text-gray-500">Enter all long-term plan fields to calculate.</p>';
            }
        } catch (error) {
            showError(error.message);
        }
    }

    // --- EVENT LISTENERS ---
    speedSlider.addEventListener('input', (e) => {
        speedValue.textContent = e.target.value;
        calculate();
    });

    calculateBtn.addEventListener('click', calculate);

    addSubscriptionBtn.addEventListener('click', () => {
        subscriptionsContainer.appendChild(createInputRow('Subscription'));
        calculate();
    });

    addTripExpenseBtn.addEventListener('click', () => {
        tripExpensesContainer.appendChild(createInputRow('Expense'));
        calculate();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all buttons and hide all content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            // Activate the clicked button and show its content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });

    // --- INITIALIZATION ---
    // Add initial subscription and expense rows with default values
    subscriptionsContainer.appendChild(createInputRow('Subscription', 'Parking', '550'));
    subscriptionsContainer.appendChild(createInputRow('Subscription', 'Mobile Data', '50'));
    tripExpensesContainer.appendChild(createInputRow('Expense', 'Snacks', '20'));

    // Perform an initial calculation on page load
    calculate();
});