// Assets/scripts/main.js

// App Configuration (shared constants)
const CONFIG = {
  VERSION: "1.3.0",
  UPDATE_INTERVAL: 1000,
  SEASONS: {
    northern: {
      spring: {
        name: "Spring",
        startMonth: 2,
        startDay: 20,
        endMonth: 5,
        endDay: 20,
        icon: "fas fa-seedling",
        color: "#4ade80",
      },
      summer: {
        name: "Summer",
        startMonth: 5,
        startDay: 21,
        endMonth: 8,
        endDay: 22,
        icon: "fas fa-sun",
        color: "#fbbf24",
      },
      autumn: {
        name: "Autumn",
        startMonth: 8,
        startDay: 23,
        endMonth: 11,
        endDay: 21,
        icon: "fas fa-leaf",
        color: "#f97316",
      },
      winter: {
        name: "Winter",
        startMonth: 11,
        startDay: 22,
        endMonth: 1,
        endDay: 19,
        icon: "fas fa-snowflake",
        color: "#60a5fa",
      },
    },
    southern: {
      autumn: {
        name: "Autumn",
        startMonth: 2,
        startDay: 20,
        endMonth: 5,
        endDay: 20,
        icon: "fas fa-leaf",
        color: "#f97316",
      },
      winter: {
        name: "Winter",
        startMonth: 5,
        startDay: 21,
        endMonth: 8,
        endDay: 22,
        icon: "fas fa-snowflake",
        color: "#60a5fa",
      },
      spring: {
        name: "Spring",
        startMonth: 8,
        startDay: 23,
        endMonth: 11,
        endDay: 21,
        icon: "fas fa-seedling",
        color: "#4ade80",
      },
      summer: {
        name: "Summer",
        startMonth: 11,
        startDay: 22,
        endMonth: 1,
        endDay: 19,
        icon: "fas fa-sun",
        color: "#fbbf24",
      },
    },
  },
};

// Main app controller
const YearProgressApp = {
  // State
  updateInterval: null,
  lastProgressUpdate: 0,
  PROGRESS_UPDATE_THROTTLE: 5000,

  // Initialize everything
  init() {
    console.log(`Year Progress Tracker v${CONFIG.VERSION} initializing...`);

    // Initialize state
    APP_STATE.init();

    // Initialize UI elements
    APP_UI.initElements();

    // Check for streak resets on load
    APP_LOGIC.checkStreakReset();
    APP_LOGIC.checkGoalStreakReset(); // ✅ NEW: Check goal streak reset

    // Set version info
    if (APP_UI.elements.versionInfo) {
      APP_UI.elements.versionInfo.textContent = `v${CONFIG.VERSION}`;
    }

    // Set up event listeners
    this.setupEventListeners();

    // Initial UI updates
    this.updateAllDisplays();
    APP_UI.updateCheckInButton();
    APP_UI.updateGoalDisplay();
    APP_UI.updateStreakDisplay();
    APP_UI.showWelcomeMessage();

    // Start update interval
    this.startUpdates();

    console.log("App initialized successfully");
  },

  // Set up event listeners
  setupEventListeners() {
    // Season dropdown
    if (APP_UI.elements.seasonDropdown) {
      APP_UI.elements.seasonDropdown.addEventListener("change", () => {
        this.updateSeason();
      });
    }

    // Check-in button
    if (APP_UI.elements.checkInButton) {
      APP_UI.elements.checkInButton.addEventListener("click", () => {
        this.handleCheckIn();
      });
    }

    // Goal progress button
    if (APP_UI.elements.progressButton) {
      APP_UI.elements.progressButton.addEventListener("click", () => {
        this.handleGoalProgress();
      });
    }

    // Save goal button
    if (APP_UI.elements.saveGoalButton) {
      APP_UI.elements.saveGoalButton.addEventListener("click", () => {
        this.handleSaveGoal();
      });
    }

    // Edit goal button
    if (APP_UI.elements.editGoalButton) {
      APP_UI.elements.editGoalButton.addEventListener("click", () => {
        APP_UI.showGoalSetup();
      });
    }

    // Goal duration selector
    if (APP_UI.elements.goalDuration) {
      APP_UI.elements.goalDuration.addEventListener("change", (e) => {
        if (APP_UI.elements.customDuration) {
          APP_UI.elements.customDuration.style.display =
            e.target.value === "custom" ? "block" : "none";
        }
      });
    }
  },

  // Handle check-in
  handleCheckIn() {
    console.log("Handling check-in...");

    const result = APP_LOGIC.processStreakCheckIn();

    if (result.success) {
      console.log("Check-in successful, new streak:", result.streak);

      // ✅ Update streak count IMMEDIATELY
      APP_UI.updateStreakDisplay();

      // ✅ Update button text to "Showed up today!"
      APP_UI.updateCheckInButton();

      // ✅ Show success message
      APP_UI.showStreakMessage(result.message);

      // ✅ Animate button
      if (APP_UI.elements.checkInButton) {
        APP_UI.elements.checkInButton.classList.add("check-in-pulse");
        setTimeout(() => {
          APP_UI.elements.checkInButton.classList.remove("check-in-pulse");
        }, 500);
      }

      console.log(
        "UI updated, streak count should now be:",
        APP_STATE.streak.count,
      );
    } else {
      APP_UI.showStreakMessage(result.message);
    }
  },

  // Handle goal progress
  handleGoalProgress() {
    console.log("Handling goal progress...");

    const result = APP_LOGIC.processGoalProgress();

    if (result.success) {
      console.log(
        "Goal progress successful, progress:",
        result.progressDays,
        "streak:",
        result.goalStreak,
      );

      // ✅ Update goal display IMMEDIATELY
      APP_UI.updateGoalDisplay();

      // ✅ Show success message
      APP_UI.showGoalMessage(result.message);

      // ✅ Check and show goal streak warning
      APP_UI.checkGoalStreakWarning();

      // ✅ Animate button
      if (APP_UI.elements.progressButton) {
        APP_UI.elements.progressButton.classList.add("check-in-pulse");
        setTimeout(() => {
          APP_UI.elements.progressButton.classList.remove("check-in-pulse");
        }, 500);
      }

      // ✅ If goal was reset, show special message
      if (result.message.includes("reset to 0")) {
        APP_UI.showGoalMessage(
          "💔 Progress reset! Track daily to build a streak and avoid resets.",
          false,
          8000,
        );
      }
    } else {
      APP_UI.showGoalMessage(result.message, true);
    }
  },

  // Handle save goal
  handleSaveGoal() {
    if (!APP_UI.elements.goalInput || !APP_UI.elements.goalDuration) return;

    const title = APP_UI.elements.goalInput.value.trim();

    if (!title) {
      APP_UI.showGoalMessage("Please enter a goal!", true);
      return;
    }

    let totalDays;
    if (APP_UI.elements.goalDuration.value === "custom") {
      const customDaysInput = APP_UI.elements.customDays;
      totalDays = customDaysInput ? parseInt(customDaysInput.value) || 90 : 90;
      if (totalDays < 7) totalDays = 7;
      if (totalDays > 730) totalDays = 730;
    } else {
      totalDays = parseInt(APP_UI.elements.goalDuration.value);
    }

    const result = APP_LOGIC.setGoal(title, totalDays);

    if (result.success) {
      APP_UI.showGoalMessage(result.message);
      APP_UI.updateGoalDisplay();

      // ✅ Show goal streak rules explanation
      setTimeout(() => {
        APP_UI.showGoalMessage(
          "📢 Goal Streak Rules: Track progress EVERY day. Miss a day = progress resets to 0!",
          false,
          10000,
        );
      }, 2000);
    }
  },

  // Update all displays
  updateAllDisplays() {
    const now = new Date();
    const timestamp = now.getTime();

    // Update date/time
    APP_UI.updateDateTime(now);

    // Update year progress
    const progressData = APP_LOGIC.calculateProgress(now);
    APP_UI.updateYearProgress(progressData);

    // Throttle detailed updates
    if (timestamp - this.lastProgressUpdate > this.PROGRESS_UPDATE_THROTTLE) {
      this.lastProgressUpdate = timestamp;
    }

    // Update season
    const hemisphere = APP_UI.elements.seasonDropdown
      ? APP_UI.elements.seasonDropdown.value
      : "northern";
    APP_UI.updateSeason(now, hemisphere);
  },

  // Update season display
  updateSeason() {
    const now = new Date();
    const hemisphere = APP_UI.elements.seasonDropdown
      ? APP_UI.elements.seasonDropdown.value
      : "northern";
    APP_UI.updateSeason(now, hemisphere);
  },

  // Start update intervals
  startUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateAllDisplays();

      // ✅ Periodically check goal streak warnings
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check at specific times (e.g., evening) to remind users
      if (hours === 20 && minutes === 0) {
        // 8:00 PM
        APP_UI.checkGoalStreakWarning();
      }
    }, CONFIG.UPDATE_INTERVAL);
  },

  // Clean up
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  YearProgressApp.init();

  // Clean up on page unload
  window.addEventListener("beforeunload", () => {
    YearProgressApp.cleanup();
  });
});
