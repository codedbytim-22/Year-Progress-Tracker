// Main Application
class DailyApp {
  constructor() {
    this.state = {
      streak: {
        current: 0,
        best: 0,
        totalCheckins: 0,
        history: {},
        lastCheckin: null,
      },
      goals: [],
      theme: "light",
      isOnline: navigator.onLine,
      lastMidnightCheck: null,
      currentGreeting: "",
    };

    this.init();
  }

  init() {
    console.log("Daily App Initializing...");

    // Set current year
    document.getElementById("current-year").textContent =
      new Date().getFullYear();

    // Load saved state
    this.loadState();

    // Initialize all modules
    this.initDateTime();
    this.initProgress();
    this.initStreak();
    this.initGoals();
    this.initTheme();
    this.initEventListeners();

    // Start real-time updates
    this.startRealTimeUpdates();

    // Check for midnight updates
    this.checkMidnightUpdate();

    // Update greeting immediately
    this.updateGreeting();

    console.log("Daily App Initialized");
  }

  // Load state from localStorage
  loadState() {
    try {
      const savedState = localStorage.getItem("daily_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.state.streak = { ...this.state.streak, ...parsed.streak };
        this.state.lastMidnightCheck = parsed.lastMidnightCheck;
      }

      const savedGoals = localStorage.getItem("daily_goals");
      if (savedGoals) {
        this.state.goals = JSON.parse(savedGoals);
      }

      const savedTheme = localStorage.getItem("daily_theme");
      if (savedTheme) {
        this.state.theme = savedTheme;
      }
    } catch (e) {
      console.error("Error loading saved state:", e);
      this.state.streak = {
        current: 0,
        best: 0,
        totalCheckins: 0,
        history: {},
        lastCheckin: null,
      };
      this.state.goals = [];
    }
  }

  // Save state to localStorage
  saveState() {
    try {
      const stateToSave = {
        streak: this.state.streak,
        lastMidnightCheck: this.state.lastMidnightCheck,
      };
      localStorage.setItem("daily_state", JSON.stringify(stateToSave));
      localStorage.setItem("daily_goals", JSON.stringify(this.state.goals));
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }

  // Update time-based greeting
  updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";
    let greetingClass = "";

    if (hour >= 5 && hour < 12) {
      greeting = "Good morning";
      greetingClass = "morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
      greetingClass = "afternoon";
    } else if (hour >= 17 && hour < 21) {
      greeting = "Good evening";
      greetingClass = "evening";
    } else {
      greeting = "Good night";
      greetingClass = "night";
    }

    const emojis = {
      morning: "🌅",
      afternoon: "☀️",
      evening: "🌆",
      night: "🌙",
    };

    const greetingElement = document.getElementById("greeting");
    if (greetingElement) {
      greetingElement.textContent = `${greeting} ${emojis[greetingClass] || ""}`;
      greetingElement.className = `greeting ${greetingClass}`;
    }

    this.state.currentGreeting = greeting;
  }

  // Update date and time in real-time
  updateDateTime() {
    const now = new Date();

    // Update greeting if hour has changed
    const currentHour = now.getHours();
    if (currentHour !== this.lastCheckedHour) {
      this.updateGreeting();
      this.lastCheckedHour = currentHour;
    }

    // Format date
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = now.toLocaleDateString("en-US", dateOptions);
    document.getElementById("date-display").textContent = dateString;

    // Format time
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById("time-display").textContent = timeString;

    // Calculate week number
    const weekNumber = this.getWeekNumber(now);
    document.getElementById("week-display").textContent = `Week ${weekNumber}`;
  }

  // Get ISO week number
  getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;

    target.setDate(target.getDate() - dayNr + 3);

    const firstThursday = target.valueOf();

    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }

    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  // Update progress calculations
  updateProgress() {
    const now = new Date();

    // Year progress
    const yearProgress = this.calculateYearProgress(now);
    const currentYear = now.getFullYear();
    document.getElementById("year-title").textContent =
      `${currentYear} is ${yearProgress.percentage.toFixed(1)}% complete`;
    document.getElementById("year-percentage").textContent =
      `${yearProgress.percentage.toFixed(1)}%`;
    document.getElementById("year-progress-bar").style.width =
      `${yearProgress.percentage}%`;
    document.getElementById("year-days-passed").textContent =
      `${yearProgress.passed} ${yearProgress.passed === 1 ? "day" : "days"} passed`;
    document.getElementById("year-days-remaining").textContent =
      `${yearProgress.remaining} ${yearProgress.remaining === 1 ? "day" : "days"} remaining`;

    // Month progress
    const monthProgress = this.calculateMonthProgress(now);
    const monthName = now.toLocaleDateString("en-US", { month: "long" });
    document.getElementById("month-title").textContent =
      `${monthName} is ${monthProgress.percentage.toFixed(1)}% complete`;
    document.getElementById("month-percentage").textContent =
      `${monthProgress.percentage.toFixed(1)}%`;
    document.getElementById("month-progress-bar").style.width =
      `${monthProgress.percentage}%`;
    document.getElementById("month-days-passed").textContent =
      `${monthProgress.passed} ${monthProgress.passed === 1 ? "day" : "days"} passed`;
    document.getElementById("month-days-remaining").textContent =
      `${monthProgress.remaining} ${monthProgress.remaining === 1 ? "day" : "days"} remaining`;
  }

  // Calculate year progress
  calculateYearProgress(date) {
    const year = date.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeapYear ? 366 : 365;

    const yearStart = new Date(year, 0, 1);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = date - yearStart;
    const passedDays = Math.floor(diffMs / msPerDay) + 1;
    const remainingDays = totalDays - passedDays;
    const percentage = (passedDays / totalDays) * 100;

    return {
      passed: passedDays,
      remaining: Math.max(0, remainingDays),
      total: totalDays,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }

  // Calculate month progress
  calculateMonthProgress(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const monthStart = new Date(year, month, 1);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = date - monthStart;
    const passedDays = Math.floor(diffMs / msPerDay) + 1;
    const remainingDays = totalDays - passedDays;
    const percentage = (passedDays / totalDays) * 100;

    return {
      passed: passedDays,
      remaining: Math.max(0, remainingDays),
      total: totalDays,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }

  // Handle daily check-in
  handleCheckIn() {
    const today = this.getTodayString();

    if (this.state.streak.history[today]) {
      this.showToast("You have already checked in today!", "info");
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateString(yesterday);

    if (this.state.streak.history[yesterdayStr]) {
      this.state.streak.current++;
    } else {
      const lastCheckin = this.state.streak.lastCheckin
        ? new Date(this.state.streak.lastCheckin)
        : null;
      if (lastCheckin) {
        const daysSinceLastCheckin = Math.floor(
          (new Date(today) - lastCheckin) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceLastCheckin > 1) {
          this.state.streak.current = 1;
        } else {
          this.state.streak.current++;
        }
      } else {
        this.state.streak.current = 1;
      }
    }

    this.state.streak.history[today] = true;
    this.state.streak.lastCheckin = today;
    this.state.streak.totalCheckins++;

    if (this.state.streak.current > this.state.streak.best) {
      this.state.streak.best = this.state.streak.current;
    }

    this.saveState();
    this.updateStreakDisplay();
    this.updateGoalCheckins();

    const checkInBtn = document.getElementById("check-in-btn");
    checkInBtn.innerHTML = '<i class="fas fa-check-circle"></i> Checked In';
    checkInBtn.classList.add("checked-in");
    checkInBtn.disabled = true;

    this.showToast(
      `Daily check-in recorded! Streak: ${this.state.streak.current} days`,
      "success",
    );
  }

  // Show toast notification
  showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Check if user has already checked in today
  checkIfCheckedInToday() {
    const today = this.getTodayString();
    const checkInBtn = document.getElementById("check-in-btn");

    if (this.state.streak.history[today]) {
      checkInBtn.innerHTML = '<i class="fas fa-check-circle"></i> Checked In';
      checkInBtn.classList.add("checked-in");
      checkInBtn.disabled = true;
    } else {
      checkInBtn.disabled = false;
      checkInBtn.classList.remove("checked-in");
      checkInBtn.innerHTML = '<i class="fas fa-check"></i> Check In';
    }
  }

  // Update streak display
  updateStreakDisplay() {
    document.getElementById("streak-display").textContent =
      this.state.streak.current;
    document.getElementById("current-streak").textContent =
      this.state.streak.current;
    document.getElementById("best-streak").textContent = this.state.streak.best;
    document.getElementById("total-checkins").textContent =
      this.state.streak.totalCheckins;

    this.updateStreakGrid();
  }

  // Update streak grid visualization
  updateStreakGrid() {
    const grid = document.getElementById("streak-grid");
    if (!grid) return;

    grid.innerHTML = "";

    const today = new Date();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = this.formatDateString(date);

      const dayElement = document.createElement("div");
      dayElement.className = "streak-day";

      if (this.state.streak.history[dateString]) {
        dayElement.classList.add("active");
      }

      if (i === 0) {
        dayElement.classList.add("today");
      }

      const label = document.createElement("div");
      label.className = "streak-day-label";
      label.textContent = daysOfWeek[date.getDay()];
      dayElement.appendChild(label);

      grid.appendChild(dayElement);
    }
  }

  // Update goal check-ins
  updateGoalCheckins() {
    const today = this.getTodayString();

    this.state.goals.forEach((goal) => {
      if (!goal.completed) {
        goal.history[today] = true;
        goal.currentStreak = this.calculateGoalStreak(goal);

        if (goal.currentStreak >= goal.duration) {
          goal.completed = true;
          goal.completedAt = new Date().toISOString();
        }
      }
    });

    this.saveState();
    this.renderGoals();
  }

  // Calculate goal streak
  calculateGoalStreak(goal) {
    const history = goal.history;
    let streak = 0;
    let date = new Date();

    while (true) {
      const dateString = this.formatDateString(date);

      if (history[dateString]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // Toggle goal modal
  toggleModal(show) {
    const modal = document.getElementById("goal-modal");
    modal.style.display = show ? "flex" : "none";

    if (show) {
      setTimeout(() => {
        document.getElementById("goal-name").focus();
      }, 100);
    } else {
      document.getElementById("goal-form").reset();
    }
  }

  // Handle adding a new goal
  handleAddGoal(e) {
    e.preventDefault();

    const name = document.getElementById("goal-name").value.trim();
    const duration = parseInt(document.getElementById("goal-duration").value);

    if (!name) {
      this.showToast("Please enter a goal name", "warning");
      return;
    }

    if (duration < 1 || duration > 365) {
      this.showToast("Duration must be between 1 and 365 days", "warning");
      return;
    }

    const newGoal = {
      id: Date.now(),
      name,
      duration,
      history: {},
      currentStreak: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.state.goals.push(newGoal);
    this.saveState();
    this.renderGoals();
    this.toggleModal(false);

    this.showToast("Goal added successfully!", "success");
  }

  // Render goals
  renderGoals() {
    const container = document.getElementById("goals-list");
    if (!container) return;

    container.innerHTML = "";

    if (this.state.goals.length === 0) {
      container.innerHTML = `
        <div class="goal-item">
          <div class="goal-info">
            <h3>No goals yet</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">
              Click "Add Goal" to create your first goal!
            </p>
          </div>
        </div>
      `;
      return;
    }

    const sortedGoals = [...this.state.goals].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sortedGoals.forEach((goal) => {
      const goalElement = this.createGoalElement(goal);
      container.appendChild(goalElement);
    });
  }

  // Create goal element
  createGoalElement(goal) {
    const element = document.createElement("div");
    element.className = `goal-item ${goal.completed ? "goal-complete" : ""}`;

    const percentage = Math.min(
      100,
      (goal.currentStreak / goal.duration) * 100,
    );
    const today = this.getTodayString();

    element.innerHTML = `
      <div class="goal-header">
        <div class="goal-info">
          <h3>${goal.name}</h3>
          <div class="goal-meta">
            <span class="goal-type">${goal.duration} days</span>
            <span>${goal.currentStreak}/${goal.duration} days</span>
            <span>${percentage.toFixed(0)}% complete</span>
          </div>
        </div>
        <button class="goal-check-in-btn" data-id="${goal.id}" 
                ${goal.completed || goal.history[today] ? "disabled" : ""}>
          <i class="fas fa-${goal.history[today] ? "check-circle" : "check"}"></i>
          ${goal.history[today] ? "Checked In" : "Check In"}
        </button>
      </div>
      
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
      
      <div class="goal-grid" id="goal-grid-${goal.id}">
        <!-- Goal days will be dynamically added -->
      </div>
      
      <div class="goal-stats">
        <span>Current Streak: <strong>${goal.currentStreak}</strong> days</span>
        <span>Started: ${new Date(goal.createdAt).toLocaleDateString()}</span>
      </div>
      
      ${
        !goal.completed
          ? `
      <div class="goal-actions">
        <button class="goal-btn delete" data-id="${goal.id}" data-action="delete">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
      `
          : `
      <div style="color: var(--success); font-weight: 600; margin-top: 1rem;">
        <i class="fas fa-trophy"></i> Completed on ${new Date(goal.completedAt).toLocaleDateString()}
      </div>
      `
      }
    `;

    const checkInBtn = element.querySelector(".goal-check-in-btn");
    const deleteBtn = element.querySelector(".goal-btn.delete");

    if (checkInBtn) {
      checkInBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleGoalCheckIn(goal.id);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteGoal(goal.id);
      });
    }

    this.renderGoalGrid(goal);

    if (goal.history[today]) {
      checkInBtn.classList.add("checked-in");
    }

    return element;
  }

  // Handle goal check-in
  handleGoalCheckIn(goalId) {
    const goal = this.state.goals.find((g) => g.id === goalId);
    if (!goal || goal.completed) return;

    const today = this.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateString(yesterday);

    if (goal.history[today]) {
      this.showToast("Already checked in for this goal today!", "info");
      return;
    }

    if (goal.history[yesterdayStr]) {
      goal.currentStreak++;
    } else {
      const lastCheckinDate = Object.keys(goal.history)
        .filter((date) => goal.history[date])
        .sort()
        .pop();

      if (lastCheckinDate) {
        const lastCheckin = new Date(lastCheckinDate);
        const daysSinceLast = Math.floor(
          (new Date(today) - lastCheckin) / (1000 * 60 * 60 * 24),
        );

        if (daysSinceLast === 1) {
          goal.currentStreak++;
        } else if (daysSinceLast > 1) {
          goal.currentStreak = 1;
        }
      } else {
        goal.currentStreak = 1;
      }
    }

    goal.history[today] = true;

    if (goal.currentStreak >= goal.duration) {
      goal.completed = true;
      goal.completedAt = new Date().toISOString();
      this.showToast(`🎉 Goal completed: ${goal.name}!`, "success");
    } else {
      this.showToast(
        `Goal check-in recorded! Current streak: ${goal.currentStreak} days`,
        "success",
      );
    }

    this.saveState();
    this.renderGoals();
  }

  // Render goal grid visualization
  renderGoalGrid(goal) {
    const grid = document.getElementById(`goal-grid-${goal.id}`);
    if (!grid) return;

    grid.innerHTML = "";

    const today = new Date();
    const startDate = new Date(goal.createdAt);
    const isMobile = window.innerWidth < 768;
    const daysToShow = isMobile
      ? Math.min(goal.duration, 20)
      : Math.min(goal.duration, 30);

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      if (date < startDate) continue;

      const dateString = this.formatDateString(date);

      const dayElement = document.createElement("div");
      dayElement.className = "goal-day";

      if (goal.history[dateString]) {
        dayElement.classList.add("checked");
      } else if (date < today) {
        dayElement.classList.add("missed");
      }

      if (i === 0) {
        dayElement.classList.add("today");
      }

      grid.appendChild(dayElement);
    }
  }

  // Delete goal
  deleteGoal(goalId) {
    if (
      confirm(
        "Are you sure you want to delete this goal? All progress will be lost.",
      )
    ) {
      this.state.goals = this.state.goals.filter((g) => g.id !== goalId);
      this.saveState();
      this.renderGoals();
      this.showToast("Goal deleted", "info");
    }
  }

  // Toggle theme
  toggleTheme() {
    this.state.theme = this.state.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.state.theme);
    localStorage.setItem("daily_theme", this.state.theme);
    this.updateThemeIcon();
  }

  // Update theme icon
  updateThemeIcon() {
    const icon = document.querySelector("#theme-toggle i");
    if (this.state.theme === "light") {
      icon.className = "fas fa-moon";
      icon.setAttribute("aria-label", "Switch to dark mode");
    } else {
      icon.className = "fas fa-sun";
      icon.setAttribute("aria-label", "Switch to light mode");
    }
  }

  // Update online status
  updateOnlineStatus() {
    this.state.isOnline = navigator.onLine;
    const indicator = document.getElementById("offline-indicator");
    indicator.style.display = this.state.isOnline ? "none" : "flex";

    if (!this.state.isOnline) {
      this.showToast(
        "You are offline. Changes will be saved locally.",
        "warning",
      );
    }
  }

  // Start real-time updates
  startRealTimeUpdates() {
    setInterval(() => this.updateDateTime(), 1000);
    setInterval(() => this.updateProgress(), 60000);
    setInterval(() => this.checkMidnightUpdate(), 60000);
    setInterval(() => this.updateGreeting(), 3600000);
  }

  // Check for midnight update
  checkMidnightUpdate() {
    const now = new Date();
    const today = this.getTodayString();

    if (this.state.lastMidnightCheck === today) return;

    if (now.getHours() === 0 && now.getMinutes() < 5) {
      this.handleNewDay();
      this.state.lastMidnightCheck = today;
      this.saveState();
    }
  }

  // Handle new day
  handleNewDay() {
    console.log("New day detected, checking streaks...");

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateString(yesterday);
    const todayStr = this.getTodayString();

    if (
      !this.state.streak.history[yesterdayStr] &&
      this.state.streak.current > 0
    ) {
      this.state.streak.current = 0;
    }

    const checkInBtn = document.getElementById("check-in-btn");
    if (!this.state.streak.history[todayStr]) {
      checkInBtn.innerHTML = '<i class="fas fa-check"></i> Check In';
      checkInBtn.classList.remove("checked-in");
      checkInBtn.disabled = false;
    }

    this.state.goals.forEach((goal) => {
      if (!goal.completed && !goal.history[yesterdayStr]) {
        goal.currentStreak = 0;
      }
    });

    this.saveState();
    this.updateStreakDisplay();
    this.renderGoals();

    this.showToast("New day! Time to check in!", "info");
  }

  // Initialize event listeners
  initEventListeners() {
    document
      .getElementById("theme-toggle")
      .addEventListener("click", () => this.toggleTheme());
    document
      .getElementById("check-in-btn")
      .addEventListener("click", () => this.handleCheckIn());
    document
      .getElementById("add-goal-btn")
      .addEventListener("click", () => this.toggleModal(true));
    document
      .getElementById("close-modal")
      .addEventListener("click", () => this.toggleModal(false));
    document
      .getElementById("cancel-goal")
      .addEventListener("click", () => this.toggleModal(false));
    document
      .getElementById("goal-form")
      .addEventListener("submit", (e) => this.handleAddGoal(e));

    document.getElementById("goal-modal").addEventListener("click", (e) => {
      if (e.target.id === "goal-modal") {
        this.toggleModal(false);
      }
    });

    window.addEventListener("online", () => this.updateOnlineStatus());
    window.addEventListener("offline", () => this.updateOnlineStatus());

    this.checkIfCheckedInToday();
  }

  // Helper methods
  getTodayString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Initialize modules
  initDateTime() {
    this.updateDateTime();
    this.updateProgress();
  }

  initProgress() {
    this.updateProgress();
  }

  initStreak() {
    this.updateStreakDisplay();
    this.checkIfCheckedInToday();
  }

  initGoals() {
    this.renderGoals();
  }

  initTheme() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
    this.updateThemeIcon();
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty("--transition", "none");
  }

  window.dailyApp = new DailyApp();
});
