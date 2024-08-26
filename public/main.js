// Doors constant
const DOORS = [
  { is_winner: false, is_open: false, i: 0 },
  { is_winner: true, is_open: false, i: 1 },
  { is_winner: false, is_open: false, i: 2 },
];

const N_ITERATIONS = 1000;

// Function to simulate one round of the Monty Hall problem
function simulateMontyHall(doors) {
  const initialChoice = chooseClosedDoor(doors, []);
  const adjustedDoors = openNonWinner(doors, [initialChoice]);
  const finalChoice = chooseClosedDoor(adjustedDoors, [initialChoice]);

  return {
    won_with_switch: doors[finalChoice].is_winner,
    won_without_switch: doors[initialChoice].is_winner,
  };
}

// Main simulation function
async function simulationMain(chart) {
  let state = initializeState();

  console.log("Starting the simulation");
  for (let i = 0; i < N_ITERATIONS; i++) {
    const result = simulateMontyHall(DOORS);
    state = updateState(state, result, i);

    if (i % 20 == 0 || i === N_ITERATIONS - 1) {
      console.log(state);
      updateChart(chart, state.chartData);

      // Allow the browser to update the UI
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

// Function to choose a closed door
function chooseClosedDoor(doors, excluded_indices = []) {
  const closedDoors = pipe(filterClosed, (d) =>
    filterExclude(d, excluded_indices),
  )(doors);
  const choice = oneOf(closedDoors);
  return choice.i;
}

// Function to open a non-winning door
function openNonWinner(doors, excluded_indices) {
  const availDoors = pipe(filterNonWinner, (d) =>
    filterExclude(d, excluded_indices),
  )(doors);
  const choice = oneOf(availDoors);

  // Open the door
  return doors.map((door) =>
    door.i === choice.i ? { ...door, is_open: true } : door,
  );
}

function oneOf(arr) {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Charting Functions
function initializeState() {
  return {
    switchWins: 0,
    stayWins: 0,
    totalGames: 0,
    chartData: {
      labels: Array.from({ length: N_ITERATIONS }, (_, i) => i + 1),
      datasets: [
        { data: Array(N_ITERATIONS).fill(null), label: "Switch" },
        { data: Array(N_ITERATIONS).fill(null), label: "Stay" },
      ],
    },
  };
}

function updateState(state, result, index) {
  const newState = {
    ...state,
    switchWins: state.switchWins + (result.won_with_switch ? 1 : 0),
    stayWins: state.stayWins + (result.won_without_switch ? 1 : 0),
    totalGames: index + 1,
  };
  const switchPercentage = (newState.switchWins / newState.totalGames) * 100;
  const stayPercentage = (newState.stayWins / newState.totalGames) * 100;

  newState.chartData = {
    ...state.chartData,
    datasets: [
      {
        ...state.chartData.datasets[0],
        data: [...state.chartData.datasets[0].data],
      },
      {
        ...state.chartData.datasets[1],
        data: [...state.chartData.datasets[1].data],
      },
    ],
  };
  newState.chartData.datasets[0].data[index] = switchPercentage;
  newState.chartData.datasets[1].data[index] = stayPercentage;

  return newState;
}

function updateChart(chart, newData) {
  // Store the current data for animation
  const currentData = chart.data.datasets.map((dataset) => [...dataset.data]);

  // Update datasets
  newData.datasets.forEach((dataset, index) => {
    chart.data.datasets[index].data = dataset.data;

    // Optionally update other properties
    if (dataset.label) chart.data.datasets[index].label = dataset.label;
    if (dataset.borderColor)
      chart.data.datasets[index].borderColor = dataset.borderColor;
    // Add more properties as needed
  });

  // Update labels if necessary
  if (newData.labels) {
    chart.data.labels = newData.labels;
  }

  // Update options for clearer labeling
  chart.options.plugins.legend.display = true;
  chart.options.plugins.tooltip.intersect = false;
  chart.options.plugins.tooltip.mode = "index";

  // Update the chart
  chart.update("none");
}

// Helper Functions
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

function filterClosed(doors) {
  return doors.filter((door) => !door.is_open);
}

function filterExclude(doors, excluded_indices) {
  return doors.filter((door) => !excluded_indices.includes(door.i));
}

function filterNonWinner(doors) {
  return doors.filter((door) => !door.is_winner);
}
