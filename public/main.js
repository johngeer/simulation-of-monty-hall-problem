// Doors constant
const DOORS = [
  { is_winner: false, is_open: false, i: 0 },
  { is_winner: true, is_open: false, i: 1 },
  { is_winner: false, is_open: false, i: 2 },
];

const N_ITERATIONS = 500;

// Function to simulate one round of the Monty Hall problem
function simulateMontyHall(doors) {
  const initialChoice = chooseClosedDoor(doors, []); // choose a closed door
  const adjustedDoors = openNonWinningDoor(doors, [initialChoice]); // host opens a door to show a goat
  const finalChoice = chooseClosedDoor(adjustedDoors, [initialChoice]); // switch doors

  return {
    won_with_switch: doors[finalChoice].is_winner,
    won_without_switch: doors[initialChoice].is_winner,
  };
}

// Main simulation function
async function simulationMain(chart) {
  let state = initializeState(N_ITERATIONS);

  console.log("Starting the simulation");
  // simulate N_ITERATIONS times
  for (let i = 0; i < N_ITERATIONS; i++) {
    const result = simulateMontyHall(DOORS);
    state = updateState(state, result, i); // update the record of past simulations

    if (i % 10 == 0 || i === N_ITERATIONS - 1) {
      // Update the chart with new data
      console.log(state);
      updateChart(chart, state.chartData);

      // Allow the browser to update the UI
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

function chooseClosedDoor(doors, excluded_indices = []) {
  const closedDoors = pipe(filterClosed, (d) =>
    filterExclude(d, excluded_indices),
  )(doors);
  const choice = oneOf(closedDoors);
  return choice.i;
}

function openNonWinningDoor(doors, excluded_indices) {
  const availDoors = pipe(filterNonWinner, (d) =>
    filterExclude(d, excluded_indices),
  )(doors);
  const choice = oneOf(availDoors);

  // Open the door
  return doors.map((door) =>
    door.i === choice.i ? { ...door, is_open: true } : door,
  );
}

// Question functions
function addRandomQuestions() {
  const questions = [
    "Check out the main.js file to see how this simulation works.",
    "Why are the lines more squiggly with lower numbers of simulations?",
    "How would this change if there were more doors? What would we change in the code to do simulate this?",
    "This simulation shows frequency of outcomes, how is that related to the probability of an outcome?",
    "How would this change if there were two doors with prizes rather than just one?",
    "Is switching doors _always_ the best choice?",
    "Poker players talk about 'resulting' (judging a decision based on its outcome rather than the quality of its reasoning). Could that ever lead a contestant to misjudge their decision with this problem?",
    "Does the system ever 'catch up' from a string of uncommon outcomes (like all wins or losses)?",
    "What would happen if the host randomly opened a door, regardless of whether it had a prize or not?",
    "How would the probabilities change if the contestant knew which door the host was going to open before making their initial choice?",
    "How could we modify the simulation to account for a biased host who sometimes breaks the rules?",
  ];
  for (let i = 1; i <= 3; i++) {
    const questionDiv = document.getElementById(`question-${i}`);
    if (questionDiv) {
      questionDiv.textContent = oneOf(questions);
    } else {
      console.warn(`Element with id 'question-${i}' not found.`);
    }
  }
}

// Helper Functions
function filterClosed(doors) {
  return doors.filter((door) => !door.is_open);
}

function filterExclude(doors, excluded_indices) {
  return doors.filter((door) => !excluded_indices.includes(door.i));
}

function filterNonWinner(doors) {
  return doors.filter((door) => !door.is_winner);
}

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

function oneOf(arr) {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Charting Functions
// I wouldn't focus on these too much. They don't include any interesting
// logic, and are really just about how the charting library is setup.
function initializeState(nIterations) {
  return {
    switchWins: 0,
    stayWins: 0,
    totalGames: 0,
    chartData: {
      labels: Array.from({ length: nIterations }, (_, i) => i + 1),
      datasets: [
        { data: Array(nIterations).fill(null), label: "Switch" },
        { data: Array(nIterations).fill(null), label: "Stay" },
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

  // Put together aggregates
  newState.chartData.datasets[0].data[index] =
    (newState.switchWins / newState.totalGames) * 100; // switch perc
  newState.chartData.datasets[1].data[index] =
    (newState.stayWins / newState.totalGames) * 100; // stay perc

  return newState;
}

function updateChart(chart, newData) {
  // Update datasets the chart uses
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
