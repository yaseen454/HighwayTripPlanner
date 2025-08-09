document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTS ---
    const TIME_UNITS_IN_DAYS = { day: 1, week: 7, month: 30.4375, year: 365.25 };
    const DURATION_HIERARCHY = ['days', 'weeks', 'months', 'years'];

    // --- CLASS DEFINITION ---
    class FuelCalculator {
        static OPTIMAL_SPEED_KMH = 75;
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
        }

        getSpeedAdjustedEfficiency(speedKmh) {
            const deltaSpeed = speedKmh - FuelCalculator.OPTIMAL_SPEED_KMH;
            const efficiencyFactor = 1 - FuelCalculator.EFFICIENCY_DROP_FACTOR * (deltaSpeed ** 2);
            return this.avgEfficiencyKmL * Math.max(efficiencyFactor, 0.5);
        }

        getVehicleProfile(currency) {
            const maxFuelTankPrice = this.fuelPricePerLiter * this.maxFuelTankLiters;
            const avgTheoreticalRangeKm = this.maxFuelTankLiters * this.avgEfficiencyKmL;
            return {
                "Fuel Price": { value: this.fuelPricePerLiter, unit: `${currency}/L` },
                "Tank Capacity": { value: this.maxFuelTankLiters, unit: "L" },
                "Cost to Fill Tank": { value: maxFuelTankPrice, unit: currency },
                "Avg. Efficiency": { value: this.avgEfficiencyKmL, unit: `km/L` },
                "Avg. Range": { value: avgTheoreticalRangeKm, unit: "km" },
            };
        }

        calculateSingleTrip(totalDistanceKm, averageSpeedKmh, currency) {
            const adjustedEfficiency = this.getSpeedAdjustedEfficiency(averageSpeedKmh);
            const litersNeeded = totalDistanceKm / adjustedEfficiency;
            const tripCost = litersNeeded * this.fuelPricePerLiter;
            return {
                "Trip Distance": { value: totalDistanceKm, unit: "km" },
                "Average Speed": { value: averageSpeedKmh, unit: "km/h" },
                "Adjusted Efficiency": { value: adjustedEfficiency, unit: "km/L" },
                "Fuel Required": { value: litersNeeded, unit: "L" },
                "Estimated Cost": { value: tripCost, unit: currency },
            };
        }

        planLongTermTrips(params) {
            const {
                distancePerTripKm, planDuration, tripFrequency, averageSpeedKmh,
                recurringExpenses, expensesPerTrip, incomePercentage, currency
            } = params;

            const totalDaysInPlan = planDuration.value * TIME_UNITS_IN_DAYS[planDuration.unit.slice(0, -1)];
            const tripsPerDay = tripFrequency.value / TIME_UNITS_IN_DAYS[tripFrequency.unit];
            const totalTrips = totalDaysInPlan * tripsPerDay;
            const adjustedEfficiency = this.getSpeedAdjustedEfficiency(averageSpeedKmh);
            const totalDistancePlanned = distancePerTripKm * totalTrips;
            const totalLitersNeeded = totalDistancePlanned / adjustedEfficiency;
            const totalFuelCost = totalLitersNeeded * this.fuelPricePerLiter;
            const totalRecurringCost = recurringExpenses.reduce((sum, expense) => {
                const expenseCyclesInPlan = totalDaysInPlan / TIME_UNITS_IN_DAYS[expense.period];
                return sum + (expense.cost * expenseCyclesInPlan);
            }, 0);
            const totalTripExpenseCost = Object.values(expensesPerTrip).reduce((sum, cost) => sum + parseFloat(cost), 0) * totalTrips;
            const grandTotalCost = totalFuelCost + totalRecurringCost + totalTripExpenseCost;
            const totalMonths = totalDaysInPlan / TIME_UNITS_IN_DAYS.month;
            const avgMonthlyCost = totalMonths > 0 ? grandTotalCost / totalMonths : 0;
            const requiredIncome = (incomePercentage > 0 && avgMonthlyCost > 0) ? (avgMonthlyCost / incomePercentage) * 100 : 0;

            return {
                "Planning Period": { value: `${planDuration.value} ${planDuration.unit}`, unit: "" },
                "Total Trips": { value: totalTrips, unit: "trips" },
                "Total Distance": { value: totalDistancePlanned, unit: "km" },
                "Total Fuel Needed": { value: totalLitersNeeded, unit: "L" },
                "Total Fuel Cost": { value: totalFuelCost, unit: currency },
                "Total Recurring Expenses": { value: totalRecurringCost, unit: currency },
                "Total Per-Trip Expenses": { value: totalTripExpenseCost, unit: currency },
                "Grand Total Cost": { value: grandTotalCost, unit: currency },
                "Avg. Monthly Cost": { value: avgMonthlyCost, unit: currency },
                [`Income for Cost to be ${incomePercentage}%`]: { value: requiredIncome, unit: `${currency}/month` },
            };
        }
    }

    // --- DOM ELEMENTS ---
    const currencySelect = document.getElementById('currency');
    const customCurrencyInput = document.getElementById('customCurrency');
    const currencyLabels = document.querySelectorAll('.currency-label');
    const planDurationUnit = document.getElementById('planDurationUnit');
    const tripFrequencyUnit = document.getElementById('tripFrequencyUnit');
    const recurringExpensesContainer = document.getElementById('recurringExpensesContainer');
    const addRecurringExpenseBtn = document.getElementById('addRecurringExpense');
    const tripExpensesContainer = document.getElementById('tripExpensesContainer');
    const addTripExpenseBtn = document.getElementById('addTripExpense');
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
    const clearProfileBtn = document.getElementById('clearProfileBtn');
    const clearPlansBtn = document.getElementById('clearPlansBtn');
    const chartContainer = document.getElementById('chartContainer');
    const chartCanvas = document.getElementById('costChart').getContext('2d');
    let costChart;

    // --- HELPER FUNCTIONS ---
    const parseInputList = (input) => input ? input.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val)) : [];

    const createExpenseRow = (type, container) => {
        const div = document.createElement('div');
        div.className = 'flex space-x-2 items-center';
        let html = `
            <input type="text" placeholder="${type} name" class="input-field flex-grow" data-type="${type}-name">
            <input type="number" placeholder="Cost" step="0.01" min="0" class="input-field w-24" data-type="${type}-cost">
        `;
        if (type === 'Recurring') {
            html += `
                <select class="input-field w-28" data-type="${type}-period" title="Select how often this expense occurs.">
                    <option value="day">per Day</option>
                    <option value="week">per Week</option>
                    <option value="month" selected>per Month</option>
                    <option value="year">per Year</option>
                </select>
            `;
        }
        html += `
            <button class="remove-btn text-red-600 hover:text-red-700" title="Remove">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        div.innerHTML = html;
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            calculate();
        });
        container.appendChild(div);
    };

    const parseRecurringExpenses = (container) => {
        const results = [];
        container.querySelectorAll('.flex').forEach(row => {
            const name = row.querySelector('[data-type="Recurring-name"]').value.trim();
            const cost = parseFloat(row.querySelector('[data-type="Recurring-cost"]').value);
            const period = row.querySelector('[data-type="Recurring-period"]').value;
            if (name && !isNaN(cost) && cost > 0) {
                results.push({ name, cost, period });
            }
        });
        return results;
    };

    const parsePerTripExpenses = (container) => {
        const result = {};
        container.querySelectorAll('.flex').forEach(row => {
            const name = row.querySelector('[data-type$="-name"]').value.trim();
            const cost = parseFloat(row.querySelector('[data-type$="-cost"]').value);
            if (name && !isNaN(cost) && cost > 0) {
                result[name] = cost;
            }
        });
        return result;
    };

    const formatOutput = (data) => {
        let html = '';
        for (const [label, { value, unit }] of Object.entries(data)) {
            let itemClass = 'output-item';
            if (label === 'Grand Total Cost') itemClass = 'output-item output-item-total';
            else if (label === 'Avg. Monthly Cost') itemClass = 'output-item output-item-monthly';
            else if (label.includes('Income for Cost')) itemClass = 'output-item output-item-income';

            const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
            html += `
                <div class="${itemClass}">
                    <div class="label">${label}</div>
                    <div class="value">${formattedValue} <span class="unit">${unit}</span></div>
                </div>`;
        }
        return html;
    };
    
    const updateCurrencyUI = (currencyCode) => {
        currencyLabels.forEach(label => label.textContent = currencyCode);
    };

    const updateTripFrequencyOptions = () => {
        const selectedDurationUnit = planDurationUnit.value;
        const selectedIndex = DURATION_HIERARCHY.indexOf(selectedDurationUnit);
        
        let currentFrequencyValue = tripFrequencyUnit.value;
        let newFrequencyOptions = '';
        let validFrequencies = [];

        if (selectedIndex >= 0) {
            const allowedUnits = DURATION_HIERARCHY.slice(0, selectedIndex + 1).map(u => u.slice(0, -1));
            validFrequencies = ['day', 'week', 'month', 'year'].filter(unit => allowedUnits.includes(unit));
            validFrequencies.forEach(unit => {
                newFrequencyOptions += `<option value="${unit}">per ${unit.charAt(0).toUpperCase() + unit.slice(1)}</option>`;
            });
        }
        
        tripFrequencyUnit.innerHTML = newFrequencyOptions;

        if (validFrequencies.includes(currentFrequencyValue)) {
            tripFrequencyUnit.value = currentFrequencyValue;
        } else {
            tripFrequencyUnit.value = validFrequencies.length > 0 ? validFrequencies[validFrequencies.length - 1] : 'day';
        }
    };

    const showError = (message) => {
        errorText.textContent = `Error: ${message}`;
        errorOutput.classList.remove('hidden');
    };

    const hideError = () => errorOutput.classList.add('hidden');

    // --- CHART LOGIC ---
    const initializeChart = () => {
        costChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Grand Total Cost',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Avg. Monthly Cost',
                        data: [],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Speed (km/h)' } },
                    y: { title: { display: true, text: 'Cost' }, beginAtZero: true }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                     legend: {
                        position: 'top',
                    },
                },
            }
        });
    };

    const updateChart = (calculator, longTermParams) => {
        if (!calculator || !longTermParams || [longTermParams.distancePerTripKm, longTermParams.planDuration.value, longTermParams.tripFrequency.value].some(isNaN)) {
            chartContainer.classList.add('hidden');
            return;
        }

        chartContainer.classList.remove('hidden');

        const speeds = [];
        const totalCosts = [];
        const monthlyCosts = [];
        
        for (let speed = 30; speed <= 140; speed += 10) {
            speeds.push(speed);
            const paramsForSpeed = { ...longTermParams, averageSpeedKmh: speed };
            const results = calculator.planLongTermTrips(paramsForSpeed);
            totalCosts.push(results['Grand Total Cost'].value);
            monthlyCosts.push(results['Avg. Monthly Cost'].value);
        }

        costChart.data.labels = speeds;
        costChart.data.datasets[0].data = totalCosts;
        costChart.data.datasets[1].data = monthlyCosts;
        costChart.options.scales.y.title.text = `Cost (${longTermParams.currency})`;
        costChart.update();
    };


    // --- MAIN CALCULATION LOGIC ---
    function calculate() {
        hideError();
        try {
            const currency = currencySelect.value === 'other' ? customCurrencyInput.value.toUpperCase() : currencySelect.value;
            const fuelPrice = parseFloat(document.getElementById('fuelPrice').value);
            const tankCapacity = parseFloat(document.getElementById('tankCapacity').value);
            const fuelEfficiency = parseInputList(document.getElementById('fuelEfficiency').value);
            const averageSpeed = parseFloat(speedSlider.value);

            if (isNaN(fuelPrice) || isNaN(tankCapacity) || fuelEfficiency.length === 0) {
                throw new Error("Please fill all vehicle profile fields with valid numbers.");
            }
            if (!currency) {
                 throw new Error("Please select or enter a currency code.");
            }

            const calculator = new FuelCalculator(fuelPrice, tankCapacity, fuelEfficiency);

            // 1. Vehicle Profile
            vehicleOutput.innerHTML = formatOutput(calculator.getVehicleProfile(currency));

            // 2. Single Trip
            const singleTripDistance = parseFloat(document.getElementById('singleTripDistance').value);
            if (!isNaN(singleTripDistance) && singleTripDistance > 0) {
                singleOutput.innerHTML = formatOutput(calculator.calculateSingleTrip(singleTripDistance, averageSpeed, currency));
            } else {
                singleOutput.innerHTML = '<p class="text-gray-500">Enter a distance to calculate.</p>';
            }

            // 3. Long-Term Plan
            const longTermParams = {
                distancePerTripKm: parseFloat(document.getElementById('longTermDistance').value),
                planDuration: {
                    value: parseInt(document.getElementById('planDurationValue').value, 10),
                    unit: document.getElementById('planDurationUnit').value,
                },
                tripFrequency: {
                    value: parseInt(document.getElementById('tripFrequencyValue').value, 10),
                    unit: document.getElementById('tripFrequencyUnit').value,
                },
                averageSpeedKmh: averageSpeed,
                recurringExpenses: parseRecurringExpenses(recurringExpensesContainer),
                expensesPerTrip: parsePerTripExpenses(tripExpensesContainer),
                incomePercentage: parseFloat(document.getElementById('incomePercentage').value),
                currency: currency
            };

            if ([longTermParams.distancePerTripKm, longTermParams.planDuration.value, longTermParams.tripFrequency.value].some(isNaN)) {
                 longtermOutput.innerHTML = '<p class="text-gray-500">Enter all long-term plan fields to calculate.</p>';
                 updateChart(null, null); // Hide chart
            } else {
                longtermOutput.innerHTML = formatOutput(calculator.planLongTermTrips(longTermParams));
                updateChart(calculator, longTermParams); // Update chart with data
            }

        } catch (error) {
            showError(error.message);
            updateChart(null, null); // Hide chart on error
        }
    }

    // --- EVENT LISTENERS ---
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', calculate);
    });

    currencySelect.addEventListener('change', (e) => {
        const isOther = e.target.value === 'other';
        customCurrencyInput.classList.toggle('hidden', !isOther);
        if (!isOther) {
            updateCurrencyUI(e.target.value);
        } else {
            customCurrencyInput.focus();
        }
        calculate(); // Calculate on any change
    });
    
    customCurrencyInput.addEventListener('input', () => {
        updateCurrencyUI(customCurrencyInput.value.toUpperCase());
        calculate();
    });

    planDurationUnit.addEventListener('change', () => {
        updateTripFrequencyOptions();
        calculate();
    });

    speedSlider.addEventListener('input', (e) => {
        speedValue.textContent = e.target.value;
        // No need to call calculate() here, it's already handled by the generic listener
    });

    calculateBtn.addEventListener('click', calculate);

    addRecurringExpenseBtn.addEventListener('click', () => createExpenseRow('Recurring', recurringExpensesContainer));
    addTripExpenseBtn.addEventListener('click', () => createExpenseRow('Per-Trip', tripExpensesContainer));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            button.classList.add('active');
            document.getElementById(button.getAttribute('data-tab')).classList.remove('hidden');
        });
    });
    
    clearProfileBtn.addEventListener('click', () => {
        document.getElementById('fuelPrice').value = '';
        document.getElementById('tankCapacity').value = '';
        document.getElementById('fuelEfficiency').value = '';
        calculate();
    });

    clearPlansBtn.addEventListener('click', () => {
        document.getElementById('singleTripDistance').value = '';
        document.getElementById('longTermDistance').value = '';
        document.getElementById('planDurationValue').value = '1';
        document.getElementById('tripFrequencyValue').value = '1';
        document.getElementById('incomePercentage').value = '10';
        recurringExpensesContainer.innerHTML = '';
        tripExpensesContainer.innerHTML = '';
        // No need to re-add rows, user can click the "Add" button
        calculate();
    });


    // --- INITIALIZATION ---
    initializeChart();
    createExpenseRow('Recurring', recurringExpensesContainer);
    createExpenseRow('Per-Trip', tripExpensesContainer);
    updateTripFrequencyOptions();
    calculate();
});
