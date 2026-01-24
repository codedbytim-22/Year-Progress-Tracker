// Assets/scripts/state.js - UPDATED

const APP_STATE = {
  // ... (existing theme and streak state) ...

  // Goal state schema - UPDATED
  goal: {
    title: "",
    startDate: null, // "YYYY-MM-DD"
    progressDays: 0,
    totalDays: 90,
    checkIns: {}, // "YYYY-MM-DD": true
    completed: false,
    lastProgressDate: null, // "YYYY-MM-DD" - NEW: Track last progress date
    goalStreak: 0, // NEW: Goal streak counter
    longestGoalStreak: 0, // NEW: Longest goal streak
  },

  // ... (existing initialization and loading methods) ...

  // Goal methods - UPDATED
  loadGoal() {
    try {
      const saved = localStorage.getItem("yearProgress_goal");
      if (saved) {
        const data = JSON.parse(saved);
        this.goal = { ...this.goal, ...data };
      }
    } catch (e) {
      console.error("Error loading goal:", e);
    }
  },

  saveGoal() {
    try {
      localStorage.setItem("yearProgress_goal", JSON.stringify(this.goal));
    } catch (e) {
      console.error("Error saving goal:", e);
    }
  },

  // ... (existing utility methods) ...
};
