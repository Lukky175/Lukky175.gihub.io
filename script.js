// -----------------------------------------------------------------------------
// STORAGE KEY
// -----------------------------------------------------------------------------
const STORAGE_KEY = "fittrack_project_state_v1";

// -----------------------------------------------------------------------------
// DEFAULT STATE
// -----------------------------------------------------------------------------
const defaultOverview = () => ({
  today: { steps: 0, calories: 0, water: 0 },
  goals: { steps: 8000, cal: 500, water: 3000, dailyCalGoal: 2000 },
  theme: "light"
});

const defaultActivity = () => ({ items: [] });
const defaultMeals = () => ({ Breakfast: [], Lunch: [], Dinner: [] });
const defaultInsights = () => ({
  activitiesPerDay: [0,0,0,0,0,0,0],
  caloriesPerDay: [0,0,0,0,0,0,0]
});

// -----------------------------------------------------------------------------
// LOAD & SAVE
// -----------------------------------------------------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        OverviewData: defaultOverview(),
        ActivityData: defaultActivity(),
        MealPlannerData: defaultMeals(),
        InsightsData: defaultInsights()
      };
    }
    const parsed = JSON.parse(raw);
    return {
      OverviewData: parsed.OverviewData || defaultOverview(),
      ActivityData: parsed.ActivityData || defaultActivity(),
      MealPlannerData: parsed.MealPlannerData || defaultMeals(),
      InsightsData: parsed.InsightsData || defaultInsights()
    };
  } catch (e) {
    return {
      OverviewData: defaultOverview(),
      ActivityData: defaultActivity(),
      MealPlannerData: defaultMeals(),
      InsightsData: defaultInsights()
    };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ OverviewData, ActivityData, MealPlannerData, InsightsData })
  );
}

// -----------------------------------------------------------------------------
// GLOBAL STATE
// -----------------------------------------------------------------------------
let { OverviewData, ActivityData, MealPlannerData, InsightsData } = loadState();

// -----------------------------------------------------------------------------
// REFS
// -----------------------------------------------------------------------------
const navBtns = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const liveClock = document.getElementById("liveClock");
const themeToggle = document.getElementById("themeToggle");

// overview
const stepsText = document.getElementById("stepsText");
const calText = document.getElementById("calText");
const waterText = document.getElementById("waterText");
const stepsCount = document.getElementById("stepsCount");
const calCount = document.getElementById("calCount");
const waterCount = document.getElementById("waterCount");
const stepsProgress = document.getElementById("stepsProgress");
const calProgress = document.getElementById("calProgress");
const waterProgress = document.getElementById("waterProgress");

const stepsGoalDisplay = document.getElementById("stepsGoalDisplay");
const calGoalDisplay = document.getElementById("calGoalDisplay");
const waterGoalDisplay = document.getElementById("waterGoalDisplay");
const dailyCalGoalDisplay = document.getElementById("dailyCalGoalDisplay");

const goUpdateProgress = document.getElementById("goUpdateProgress");
const openGoalModal = document.getElementById("openGoalModal");
const resetDashboard = document.getElementById("resetDashboard");

// activity
const openActivityForm = document.getElementById("openActivityForm");
const activityFormArea = document.getElementById("activityFormArea");
const activityForm = document.getElementById("activityForm");
const cancelActivity = document.getElementById("cancelActivity");
const activityList = document.getElementById("activityList");
const activityFilter = document.getElementById("activityFilter");

// meals
const mealConfig = {
  Breakfast: { name: "mealNameB", cal: "mealCalB", list: "breakfastList" },
  Lunch: { name: "mealNameL", cal: "mealCalL", list: "lunchList" },
  Dinner: { name: "mealNameD", cal: "mealCalD", list: "dinnerList" }
};

const addMealBtns = document.querySelectorAll(".addMealBtn");
const dailyCalories = document.getElementById("dailyCalories");

// insights
const activityBars = document.getElementById("activityBars");
const calorieBars = document.getElementById("calorieBars");
const downloadSummary = document.getElementById("downloadSummary");

// modals
const goalModal = document.getElementById("goalModal");
const closeGoalModal = document.getElementById("closeGoalModal");
const saveGoals = document.getElementById("saveGoals");

const goalSteps = document.getElementById("goalSteps");
const goalCalories = document.getElementById("goalCalories");
const goalWater = document.getElementById("goalWater");
const goalDailyCal = document.getElementById("goalDailyCal");

const resetConfirmModal = document.getElementById("resetConfirmModal");
const cancelReset = document.getElementById("cancelReset");
const confirmReset = document.getElementById("confirmReset");

// steps / water modals
const stepsModal = document.getElementById("stepsModalBackdrop");
const waterModal = document.getElementById("waterModalBackdrop");

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------
function setActivePage(id) {
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.page === id));
}

function formatShort(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

function updateCircle(elem, value, goal) {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100));
  elem.setAttribute("stroke-dasharray", `${pct},100`);
}

function escapeHtml(s) {
  return s ? s.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[m]) : "";
}

function saveAndRender() {
  saveState();
  renderAll();
}

// -----------------------------------------------------------------------------
// THEME + CLOCK
// -----------------------------------------------------------------------------
if (OverviewData.theme === "dark") document.body.classList.add("dark");
themeToggle.checked = OverviewData.theme === "dark";

themeToggle.addEventListener("change", () => {
  OverviewData.theme = themeToggle.checked ? "dark" : "light";
  document.body.classList.toggle("dark", themeToggle.checked);
  saveState();
});

setInterval(() => {
  liveClock.textContent = new Date().toLocaleTimeString();
}, 1000);

// -----------------------------------------------------------------------------
// RENDER OVERVIEW (MAIN FUNCTION)
// -----------------------------------------------------------------------------
function renderOverview() {
  const t = OverviewData.today;
  const g = OverviewData.goals;

  stepsText.textContent = t.steps;
  calText.textContent = `${t.calories} kcal`;
  waterText.textContent = `${t.water} ml`;

  stepsCount.textContent = formatShort(t.steps);
  calCount.textContent = formatShort(t.calories);
  waterCount.textContent = t.water >= 1000
    ? (t.water / 1000).toFixed(1) + "L"
    : t.water + " ml";

  stepsGoalDisplay.textContent = g.steps;
  calGoalDisplay.textContent = g.cal;
  waterGoalDisplay.textContent = g.water;
  dailyCalGoalDisplay.textContent = g.dailyCalGoal;

  updateCircle(stepsProgress, t.steps, g.steps);
  updateCircle(calProgress, t.calories, g.cal);
  updateCircle(waterProgress, t.water, g.water);
}

// -----------------------------------------------------------------------------
// ACTIVITIES
// -----------------------------------------------------------------------------
function renderActivities() {
  activityList.innerHTML = "";
  const filter = activityFilter.value || "All";

  ActivityData.items.forEach(item => {
    if (filter !== "All" && item.period !== filter) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong><br>
        <small>${item.duration} mins • ${item.calories} kcal</small>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span class="muted">${item.period}</span>
        <button class="btn ghost remove-act" data-id="${item.id}">Remove</button>
      </div>
    `;
    activityList.appendChild(li);
  });
}

activityForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("actName").value.trim();
  const duration = Number(document.getElementById("actDuration").value);
  const calories = Number(document.getElementById("actCalories").value);
  const period = document.getElementById("actPeriod").value;

  if (!name || duration <= 0 || calories <= 0) return;

  ActivityData.items.unshift({
    id: Date.now(),
    name,
    duration,
    calories,
    period,
    ts: Date.now()
  });

  // update overview approximations
  OverviewData.today.calories += calories;

  const d = new Date().getDay();
  const di = d === 0 ? 6 : d - 1;

  InsightsData.activitiesPerDay[di]++;
  InsightsData.caloriesPerDay[di] += calories;

  activityForm.reset();
  activityFormArea.classList.add("hidden");
  saveAndRender();
});

activityList.addEventListener("click", e => {
  if (!e.target.classList.contains("remove-act")) return;

  const id = Number(e.target.dataset.id);
  const idx = ActivityData.items.findIndex(i => i.id === id);

  if (idx === -1) return;

  const removed = ActivityData.items.splice(idx, 1)[0];

  OverviewData.today.calories = Math.max(0, OverviewData.today.calories - removed.calories);
  OverviewData.today.steps = Math.max(0, OverviewData.today.steps - Math.round(removed.duration * 100));

  const d = new Date().getDay();
  const di = d === 0 ? 6 : d - 1;

  InsightsData.activitiesPerDay[di] = Math.max(0, InsightsData.activitiesPerDay[di] - 1);
  InsightsData.caloriesPerDay[di] = Math.max(0, InsightsData.caloriesPerDay[di] - removed.calories);

  saveAndRender();
});

// controls
openActivityForm.addEventListener("click", () => {
  activityFormArea.classList.toggle("hidden");
});
cancelActivity.addEventListener("click", () => {
  activityForm.reset();
  activityFormArea.classList.add("hidden");
});
activityFilter.addEventListener("change", renderActivities);

// -----------------------------------------------------------------------------
// MEALS
// -----------------------------------------------------------------------------
addMealBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const nameField = document.getElementById(mealConfig[target].name);
    const calField = document.getElementById(mealConfig[target].cal);

    const name = nameField.value.trim();
    const calories = Number(calField.value);

    if (!name || calories <= 0) return;

    MealPlannerData[target].push({ name, calories });

    nameField.value = "";
    calField.value = "";
    saveAndRender();
  });
});

function renderMeals() {
  let total = 0;

  Object.keys(MealPlannerData).forEach(meal => {
    const list = document.getElementById(mealConfig[meal].list);
    list.innerHTML = "";

    MealPlannerData[meal].forEach((m, i) => {
      total += m.calories;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${escapeHtml(m.name)} • ${m.calories} kcal</span>
        <button data-meal="${meal}" data-index="${i}">Remove</button>
      `;
      list.appendChild(li);
    });
  });

  dailyCalories.textContent = `${total} kcal`;

  document.querySelectorAll(".meal-list button").forEach(btn => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.meal;
      const idx = Number(btn.dataset.index);

      MealPlannerData[meal].splice(idx, 1);
      saveAndRender();
    });
  });
}

// -----------------------------------------------------------------------------
// INSIGHTS
// -----------------------------------------------------------------------------
function renderInsights() {
  activityBars.innerHTML = "";
  calorieBars.innerHTML = "";

  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const maxAct = Math.max(1, ...InsightsData.activitiesPerDay);
  const maxCal = Math.max(1, ...InsightsData.caloriesPerDay);

  InsightsData.activitiesPerDay.forEach((v,i) => {
    const wrap = document.createElement("div");
    wrap.className = "bar";

    const inner = document.createElement("div");
    inner.style.height = (Math.round((v/maxAct)*140) + 6) + "px";
    wrap.appendChild(inner);

    const label = document.createElement("span");
    label.textContent = labels[i];
    wrap.appendChild(label);

    activityBars.appendChild(wrap);
  });

  InsightsData.caloriesPerDay.forEach((v,i) => {
    const wrap = document.createElement("div");
    wrap.className = "bar";

    const inner = document.createElement("div");
    inner.style.height = (Math.round((v/maxCal)*140) + 6) + "px";
    inner.style.background = "linear-gradient(180deg,#ffd1b8,#ff8f6c)";
    wrap.appendChild(inner);

    const label = document.createElement("span");
    label.textContent = labels[i];
    wrap.appendChild(label);

    calorieBars.appendChild(wrap);
  });
}

// -----------------------------------------------------------------------------
// GOALS MODAL
// -----------------------------------------------------------------------------
openGoalModal.addEventListener("click", () => {
  goalSteps.value = OverviewData.goals.steps;
  goalCalories.value = OverviewData.goals.cal;
  goalWater.value = OverviewData.goals.water;
  goalDailyCal.value = OverviewData.goals.dailyCalGoal;
  goalModal.classList.add("show");
});
closeGoalModal.addEventListener("click", () => goalModal.classList.remove("show"));

saveGoals.addEventListener("click", () => {
  OverviewData.goals.steps = Number(goalSteps.value);
  OverviewData.goals.cal = Number(goalCalories.value);
  OverviewData.goals.water = Number(goalWater.value);
  OverviewData.goals.dailyCalGoal = Number(goalDailyCal.value);

  goalModal.classList.remove("show");
  saveAndRender();
});

// -----------------------------------------------------------------------------
// UPDATE STEPS & WATER
// -----------------------------------------------------------------------------
document.getElementById("openStepsModal").onclick = () => stepsModal.classList.add("show");
document.getElementById("closeStepsModal").onclick = () => stepsModal.classList.remove("show");

document.getElementById("openWaterModal").onclick = () => waterModal.classList.add("show");
document.getElementById("closeWaterModal").onclick = () => waterModal.classList.remove("show");

// steps
document.getElementById("addStepsBtn").onclick = () => {
  const value = Number(document.getElementById("stepsAmountInput").value);
  if (value > 0) {
    OverviewData.today.steps += value;
    saveAndRender();
  }
  stepsModal.classList.remove("show");
};

document.getElementById("removeStepsBtn").onclick = () => {
  const value = Number(document.getElementById("stepsAmountInput").value);
  if (value > 0) {
    OverviewData.today.steps = Math.max(0, OverviewData.today.steps - value);
    saveAndRender();
  }
  stepsModal.classList.remove("show");
};

// water
document.getElementById("addWaterBtn").onclick = () => {
  const value = Number(document.getElementById("waterAmountInput").value);
  if (value > 0) {
    OverviewData.today.water += value;
    saveAndRender();
  }
  waterModal.classList.remove("show");
};

document.getElementById("removeWaterBtn").onclick = () => {
  const value = Number(document.getElementById("waterAmountInput").value);
  if (value > 0) {
    OverviewData.today.water = Math.max(0, OverviewData.today.water - value);
    saveAndRender();
  }
  waterModal.classList.remove("show");
};

// -----------------------------------------------------------------------------
// RESET DASHBOARD
// -----------------------------------------------------------------------------
resetDashboard.addEventListener("click", () => {
  resetConfirmModal.classList.add("show");
});

cancelReset.addEventListener("click", () => {
  resetConfirmModal.classList.remove("show");
});

confirmReset.addEventListener("click", () => {
  OverviewData = defaultOverview();
  ActivityData = defaultActivity();
  MealPlannerData = defaultMeals();
  InsightsData = defaultInsights();

  resetConfirmModal.classList.remove("show");
  saveAndRender();
});

// -----------------------------------------------------------------------------
// DOWNLOAD SUMMARY
// -----------------------------------------------------------------------------
downloadSummary.addEventListener("click", () => {
  const lines = [
    "FitTrack Pro — Summary",
    `Date: ${new Date().toLocaleString()}`,
    "",
    `Steps: ${OverviewData.today.steps} (Goal ${OverviewData.goals.steps})`,
    `Calories: ${OverviewData.today.calories} kcal (Goal ${OverviewData.goals.cal})`,
    `Water: ${OverviewData.today.water} ml (Goal ${OverviewData.goals.water})`,
    "",
    "Activities:",
    ...ActivityData.items.map(a =>
      `- ${a.name} • ${a.duration} min • ${a.calories} kcal • ${a.period}`
    )
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fittrack_summary.txt";
  a.click();
});

// -----------------------------------------------------------------------------
// NAVIGATION
// -----------------------------------------------------------------------------
navBtns.forEach(btn =>
  btn.addEventListener("click", () => {
    setActivePage(btn.dataset.page);
    if (btn.dataset.page === "activity") renderActivities();
    if (btn.dataset.page === "meals") renderMeals();
    if (btn.dataset.page === "insights") renderInsights();
  })
);

// -----------------------------------------------------------------------------
// UPDATE PROGRESS QUICK BUTTON
// -----------------------------------------------------------------------------
goUpdateProgress.addEventListener("click", () => {
  setActivePage("activity");
  activityFormArea.classList.remove("hidden");
});

// -----------------------------------------------------------------------------
// INITIAL RENDER
// -----------------------------------------------------------------------------
function renderAll() {
  renderOverview();
  renderActivities();
  renderMeals();
  renderInsights();
}

setActivePage("overview");
renderAll();
saveState();
