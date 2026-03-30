// ========================
// HELPERS
// ========================

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    const savedValue = localStorage.getItem(key);

    if (savedValue) {
        return JSON.parse(savedValue);
    }

    return null;
}

function setResultState(element, type, message) {
    element.classList.remove("is-visible");
    element.classList.remove("success", "error", "warning");

    element.textContent = message;

    if (type) {
        element.classList.add(type);
    }

    requestAnimationFrame(function () {
        element.classList.add("is-visible");
    });
}
function resetAppUI() {
    // Reset Body
    summaryPain.textContent = "Not logged yet";
    painResult.textContent = "Your support suggestion will appear here.";
    painResult.classList.remove("success", "error", "warning");

    painLevelInput.value = 5;
    painValue.textContent = 5;
    painArea.value = "";
    painNotes.value = "";

    // Reset Mind
    summaryWorry.textContent = "Nothing saved yet";
    worryResult.textContent = "A calming response will appear here.";
    worryResult.classList.remove("success", "error", "warning");

    worryForm.reset();

    // Reset Money
    moneyEntries = [];
    renderMoneyEntries();

    if (moneyResult) {
        moneyResult.textContent = "Your financial updates will appear here.";
        moneyResult.classList.remove("success", "error", "warning");
    }

    // Reset Grace
    const defaultMessage =
        "You are allowed to slow down and take this one step at a time.";

    encouragementMessage.textContent = defaultMessage;
    summaryEncouragement.textContent = defaultMessage;

    // Reset Reflection
    reflectionResult.textContent = "Your saved reflection will appear here.";
    reflectionResult.classList.remove("success", "error", "warning");

    gratitudeForm.reset();
}

// ========================
// BODY CHECK
// ========================

const painForm = document.getElementById("pain-form");
const painLevelInput = document.getElementById("pain-level");
const painValue = document.getElementById("pain-value");
const painArea = document.getElementById("pain-area");
const painNotes = document.getElementById("pain-notes");
const painResult = document.getElementById("pain-result");
const summaryPain = document.getElementById("summary-pain");

painLevelInput.addEventListener("input", function () {
    painValue.textContent = painLevelInput.value;
});

function getPainMessage(level) {
    if (level <= 3) {
        return "Your pain seems lighter right now. Try a small reset like stretching, water, or a short break.";
    } else if (level <= 7) {
        return "Your body may need extra care today. Slow down, rest when possible, and focus on comfort.";
    } else {
        return "Your pain sounds intense right now. Prioritize rest, reduce stress, and focus only on what is necessary.";
    }
}

function displayPainEntry(entry) {
    const message = getPainMessage(entry.level);

    setResultState(
        painResult,
        "success",
        `${message} Area noted: ${entry.area}.`
    );

    summaryPain.textContent = `Pain ${entry.level}/10 - ${entry.area}`;
}

painForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const level = Number(painLevelInput.value);
    const area = painArea.value;
    const notes = painNotes.value.trim();

    if (level < 1 || level > 10) {
        setResultState(
            painResult,
            "error",
            "Something went wrong with the pain level. Please try again."
        );
        return;
    }

    if (!area) {
        setResultState(
            painResult,
            "warning",
            "Please select an area of discomfort."
        );
        return;
    }

    const painEntry = {
        level,
        area,
        notes,
    };

    displayPainEntry(painEntry);
    saveToStorage("gracePainEntry", painEntry);

    painArea.value = "";
    painNotes.value = "";
    painLevelInput.value = 5;
    painValue.textContent = 5;
});

// ========================
// CLEAR YOUR MIND
// ========================

const worryForm = document.getElementById("worry-form");
const worryText = document.getElementById("worry-text");
const controlLevel = document.getElementById("control-level");
const nextStep = document.getElementById("next-step");
const worryResult = document.getElementById("worry-result");
const summaryWorry = document.getElementById("summary-worry");

function getWorryMessage(canControl, step) {
    if (canControl === "yes") {
        if (step) {
            return `You have some control here. Focus on this one step: "${step}". You do not have to do everything at once.`;
        }

        return "You have some control here. Choose one small step and take it when you're ready.";
    }

    if (canControl === "no") {
        return "This may be out of your control right now. Take a breath and allow yourself to let go of what you cannot change in this moment.";
    }

    return "Take a moment to reflect on what you can or cannot control.";
}

function displayWorryEntry(entry) {
    const message = getWorryMessage(entry.canControl, entry.step);

    setResultState(worryResult, "success", message);
    summaryWorry.textContent = entry.worry || "No worry entered";
}

worryForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const worry = worryText.value.trim();
    const canControl = controlLevel.value;
    const step = nextStep.value.trim();

    if (!worry) {
        setResultState(
            worryResult,
            "warning",
            "Please write what is worrying you right now."
        );
        return;
    }

    if (!canControl) {
        setResultState(
            worryResult,
            "warning",
            "Please choose whether you can take action on this today."
        );
        return;
    }

    const worryEntry = {
        worry,
        canControl,
        step,
    };

    displayWorryEntry(worryEntry);
    saveToStorage("graceWorryEntry", worryEntry);

    worryForm.reset();
});

// ========================
// FINANCIAL FOCUS
// ========================

const moneyForm = document.getElementById("money-form");
const moneyConcern = document.getElementById("money-concern");
const moneyAmount = document.getElementById("money-amount");
const moneyPriority = document.getElementById("money-priority");
const moneyList = document.getElementById("money-list");
const summaryMoney = document.getElementById("summary-money");

// Create this div in your HTML under the money form if you want inline validation:
// <div id="money-result" class="result-box mt-4">Your financial updates will appear here.</div>
const moneyResult = document.getElementById("money-result");

let moneyEntries = getFromStorage("graceMoneyEntries") || [];

function updateMoneyResult(type, message) {
    if (!moneyResult) return;
    setResultState(moneyResult, type, message);
}

function renderMoneyEntries() {
    moneyList.innerHTML = "";

    if (moneyEntries.length === 0) {
        moneyList.innerHTML = `
      <li class="list-group-item rounded-4 border-0 empty-state">
        No financial concerns added yet.
      </li>
    `;
        summaryMoney.textContent = "No priority yet";
        return;
    }

    moneyEntries.forEach(function (entry) {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item rounded-4 border-0";

        listItem.innerHTML = `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h4 class="h6 mb-1">${entry.concern}</h4>
          <p class="mb-1 text-muted">
            Priority: ${entry.priority}
            ${entry.amount ? `| Amount: $${entry.amount}` : ""}
          </p>
        </div>
        <button class="btn btn-sm btn-outline-danger rounded-pill" data-id="${entry.id}">
          Remove
        </button>
      </div>
    `;

        moneyList.appendChild(listItem);
    });

    const topPriority = moneyEntries[0];
    summaryMoney.textContent = `${topPriority.concern} (${topPriority.priority})`;
}

moneyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const concern = moneyConcern.value.trim();
    const amount = moneyAmount.value.trim();
    const priority = moneyPriority.value;

    if (!concern || !priority) {
        updateMoneyResult(
            "warning",
            "Please enter a financial concern and select a priority."
        );
        return;
    }

    const newEntry = {
        id: Date.now(),
        concern,
        amount,
        priority,
    };

    moneyEntries.push(newEntry);
    saveToStorage("graceMoneyEntries", moneyEntries);
    renderMoneyEntries();

    updateMoneyResult("success", "Financial concern added successfully.");
    moneyForm.reset();
});

moneyList.addEventListener("click", function (event) {
    if (event.target.matches("button")) {
        const id = Number(event.target.dataset.id);

        moneyEntries = moneyEntries.filter(function (entry) {
            return entry.id !== id;
        });

        saveToStorage("graceMoneyEntries", moneyEntries);
        renderMoneyEntries();

        updateMoneyResult("success", "Financial concern removed.");
    }
});

// ========================
// DAILY GRACE
// ========================

const encouragementBtn = document.getElementById("encouragement-btn");
const encouragementMessage = document.getElementById("encouragement-message");
const summaryEncouragement = document.getElementById("summary-encouragement");

const encouragementMessages = [
    "You are allowed to slow down and take this one step at a time.",
    "You do not have to solve everything today.",
    "A small step still counts.",
    "Give yourself credit for continuing forward.",
    "Progress can be quiet and still be real.",
    "Rest is not failure.",
    "You are carrying a lot, and you are still here.",
    "Focus on what is possible today, not everything at once.",
];

function getRandomEncouragement() {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    return encouragementMessages[randomIndex];
}

function displayEncouragement(message) {
    encouragementMessage.textContent = message;
    summaryEncouragement.textContent = message;
}

encouragementBtn.addEventListener("click", function () {
    const message = getRandomEncouragement();
    displayEncouragement(message);
    saveToStorage("graceEncouragementMessage", message);
});

// ========================
// REFLECTION
// ========================

const gratitudeForm = document.getElementById("gratitude-form");
const gratitudeNote = document.getElementById("gratitude-note");
const smallWin = document.getElementById("small-win");
const reflectionResult = document.getElementById("reflection-result");

function displayReflection(entry) {
    const gratitudeText = entry.gratitude
        ? `Something good: "${entry.gratitude}"`
        : "Something good: Not added";

    const smallWinText = entry.win
        ? `Small win: "${entry.win}"`
        : "Small win: Not added";

    setResultState(
        reflectionResult,
        "success",
        `${gratitudeText} ${smallWinText}`
    );
}

gratitudeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const gratitude = gratitudeNote.value.trim();
    const win = smallWin.value.trim();

    if (!gratitude && !win) {
        setResultState(
            reflectionResult,
            "warning",
            "Please add something good or one small win before saving."
        );
        return;
    }

    const reflectionEntry = {
        gratitude,
        win,
    };

    displayReflection(reflectionEntry);
    saveToStorage("graceReflectionEntry", reflectionEntry);
    gratitudeForm.reset();
});
// ========================
// PAGE LOAD SETTLED WHEN PAGE FIRST OPENS
// ========================
document.querySelectorAll(".result-box, .encouragement-box").forEach(function (box) {
    box.classList.add("is-visible");
});

// ========================
// LOAD SAVED DATA
// ========================

function loadPainEntry() {
    const savedPainEntry = getFromStorage("gracePainEntry");

    if (!savedPainEntry) return;

    displayPainEntry(savedPainEntry);
}

function loadWorryEntry() {
    const savedWorryEntry = getFromStorage("graceWorryEntry");

    if (!savedWorryEntry) return;

    displayWorryEntry(savedWorryEntry);
}

function loadEncouragementMessage() {
    const savedMessage = getFromStorage("graceEncouragementMessage");

    if (!savedMessage) return;

    displayEncouragement(savedMessage);
}

function loadReflectionEntry() {
    const savedReflectionEntry = getFromStorage("graceReflectionEntry");

    if (!savedReflectionEntry) return;

    displayReflection(savedReflectionEntry);
}

// ========================
// CLEAR ALL DATA
// ========================

const clearDataBtn = document.getElementById("clear-data-btn");

clearDataBtn.addEventListener("click", function () {
    const confirmClear = confirm(
        "Are you sure you want to clear all saved data?"
    );

    if (!confirmClear) return;

    localStorage.clear();
    resetAppUI();

    setResultState(
        reflectionResult,
        "success",
        "All data has been cleared successfully."
    );
});


// ========================
// APP INITIALIZATION
// ========================

loadPainEntry();
loadWorryEntry();
loadEncouragementMessage();
loadReflectionEntry();
renderMoneyEntries();