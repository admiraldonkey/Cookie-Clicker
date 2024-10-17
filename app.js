// Get DOM Nodes
const hobbitButton = document.getElementById("hobbit-btn");
const hobbitDisplay = document.getElementById("hobbit-display");
const hpsDisplay = document.getElementById("hps-display");
const upgradeDisplay = document.getElementById("upgrade-display");
// Temp button for easy local storage manipulation
const resetButton = document.getElementById("reset-button");

// GAME STATE
// Initialise / retreive data from local storage
let hobbits = parseInt(localStorage.getItem("hobbits")) || 0;
let hps = parseInt(localStorage.getItem("hps")) || 0;
let musicOn = true;
let musicPlaying = false;

// Initialise upgrade array
let upgradeArray = [];
// Call function to add upgrades to DOM & activate listeners
setUpgrades();

// GAME LOGIC
// Increase value when button clicked
hobbitButton.addEventListener("click", generateHobbit);

function generateHobbit() {
  // Play theme on first hobbit generated
  if (hobbits == 0 && hps == 0 && musicOn == true) {
    const music = new Audio("./assets/sounds/Concerning Hobbits.mp3");
    music.play();
  }
  hobbits += 1;
  hobbitDisplay.textContent = hobbits;
  unlockUpgrades();
  updateStorage();
}

// Increase value by hps
setInterval(hobbitsPerSecond, 1000);

function hobbitsPerSecond() {
  hobbits = hobbits + hps;
  hobbitDisplay.textContent = hobbits;
  hpsDisplay.textContent = hps;
  unlockUpgrades();
  updateStorage();
}

// Function to update local storage
function updateStorage(upgrade = null) {
  // Update hobbits and hobbits per second to local storage
  localStorage.setItem("hobbits", hobbits);
  localStorage.setItem("hps", hps);
  // If an upgrade was purchased, update local storage with its current state
  if (upgrade != null) {
    let upgradeData = {
      id: upgrade.id,
      costNext: upgrade.costNext,
      owned: upgrade.value.textContent,
    };
    localStorage.setItem(upgrade.name, JSON.stringify(upgradeData));
  }
}

// UPGRADES

// Function to fetch upgrades from API
async function handleGetAPIUpgrades() {
  const response = await fetch(
    "https://cookie-upgrade-api.vercel.app/api/upgrades"
  );
  return await response.json();
}

// Function to update upgrade names then add them to the DOM
async function setUpgrades() {
  upgradeArray = await handleGetAPIUpgrades();
  // New upgrade names
  const newNames = [
    "Hobbit Hole",
    "Peace and Quiet",
    "Good Tilled Earth",
    "Pint of Ale",
    "Old Toby",
    "Bakery",
    "Gandalf's Fireworks",
    "Brewery",
    "Inn",
    "111tieth Birthday Party",
  ];

  // Change names of the retreived API data and update the DOM to display upgrades
  for (let i = 0; i < upgradeArray.length; i++) {
    upgradeArray[i].name = newNames[i];
    // Create DOM elements and give IDs
    const para = document.createElement("p");
    const button = document.createElement("button");
    const increase = document.createElement("span");
    const costSpan = document.createElement("span");
    const valueSpan = document.createElement("span");
    const buttonId = `upgrade-button-${upgradeArray[i].id}`;
    const costSpanId = `upgrade-cost-${upgradeArray[i].id}`;
    const valueSpanId = `upgrade-value-${upgradeArray[i].id}`;
    button.id = buttonId;
    costSpan.id = costSpanId;
    valueSpan.id = valueSpanId;

    // Update created elements with the appropriate default values
    button.textContent = upgradeArray[i].name;
    increase.textContent = upgradeArray[i].increase;
    // Retrieve stored upgrade info if previously purchased, else display defaults
    const storedUpgrade = localStorage.getItem(upgradeArray[i].name) || 0;
    if (storedUpgrade != 0) {
      const stored = JSON.parse(storedUpgrade);
      costSpan.textContent = stored.costNext;
      valueSpan.textContent = stored.owned;
      upgradeArray[i].costNext = stored.costNext;
    } else {
      costSpan.textContent = upgradeArray[i].cost;
      upgradeArray[i].costNext = upgradeArray[i].cost;
      valueSpan.textContent = 0;
    }

    // Add elements to DOM
    para.appendChild(button);
    button.after(increase);
    increase.after(costSpan);
    costSpan.after(valueSpan);

    // Hide all but the first upgrade when first displaying
    if (i > 0) {
      para.classList.add("locked");
    }
    upgradeDisplay.appendChild(para);
    // Add DOM elements to upgrade array
    upgradeArray[i].button = document.getElementById(buttonId);
    upgradeArray[i].costDisplay = document.getElementById(costSpanId);
    upgradeArray[i].value = document.getElementById(valueSpanId);
  }
  // Set listeners on the generated upgrade buttons
  upgradeListeners();
}

// Function to add event listeners to upgrade buttons
function upgradeListeners() {
  upgradeArray.forEach(function (elem) {
    elem.button.addEventListener("click", (e) => {
      buyNewUpgrade(elem);
    });
  });
}

// Handles logic and updates when upgrades are purchased
function buyNewUpgrade(elem) {
  if (hobbits >= elem.costNext) {
    // Update DOM elements to reflect upgrade purchase
    hobbits = hobbits - elem.costNext;
    hobbitDisplay.textContent = hobbits;
    let currentValue = parseInt(elem.value.textContent);
    elem.value.textContent = currentValue += 1;
    elem.costNext = elem.costNext + elem.cost;
    elem.costDisplay.textContent = elem.costNext;
    let newHps = (hps += elem.increase);
    hpsDisplay.textContent = newHps;
    updateStorage(elem);

    // Play sound effects when upgrade purchased
    if (musicOn == true && elem.name != "Hobbit Hole") {
      const music = new Audio(`./assets/sounds/${elem.name}.mp3`);
      // Only play if music is not already playing
      if (!musicPlaying) {
        music.play();
        musicPlaying = true;
        music.onended = function () {
          musicPlaying = false;
        };
      }
    }
  } else {
    console.log("Insufficient Hobbits!"); // TODO Display this notice to the user
  }
  unlockUpgrades();
}

// Function to unlock new upgrades
function unlockUpgrades() {
  // Only loop through if there are still locked upgrades
  if (
    upgradeArray[
      upgradeArray.length - 1
    ].button.parentElement.classList.contains("locked")
  ) {
    let currentElem = 0;
    upgradeArray.forEach(function (elem) {
      if (currentElem > 0) {
        // If upgrade is currently locked
        if (elem.button.parentElement.classList.contains("locked")) {
          // Unlock if enough hobbits available or if player owns at least one of the previous upgrade
          if (
            hobbits >= elem.cost ||
            parseInt(upgradeArray[currentElem - 1].value.textContent) > 0
          ) {
            elem.button.parentElement.classList.remove("locked");
          }
        }
      }
      currentElem++;
    });
  }
}

// Change the background image when a certain number of upgrades have been purchased
function changeBackground() {
  const body = document.querySelector("body");
  body.style.backgroundImage = "url(./assets/images/)";
}

// Reset all values when reset button pressed
resetButton.addEventListener("click", resetValues);

// Function to clear and reset all values in DOM and local storage
function resetValues() {
  localStorage.clear();
  hobbits = 0;
  hps = 0;
  hobbitDisplay.textContent = 0;
  hpsDisplay.textContent = 0;
  upgradeArray.forEach(function (elem) {
    elem.value.textContent = 0;
    elem.costDisplay.textContent = elem.cost;
  });
}
