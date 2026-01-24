// Assets/scripts/ui.js - UPDATED (partial)

const APP_UI = {
  // ... (existing elements and methods) ...

  // Update goal display - UPDATED to show streak
  updateGoalDisplay() {
    if (!APP_STATE.goal.title || !APP_STATE.goal.startDate) {
      this.showGoalSetup();
      return;
    }

    this.showGoalDisplay();

    if (this.elements.goalTitle) {
      this.elements.goalTitle.textContent = APP_STATE.goal.title;
    }

    // Calculate progress
    const progressPercent =
      (APP_STATE.goal.progressDays / APP_STATE.goal.totalDays) * 100;
    const remainingDays =
      APP_STATE.goal.totalDays - APP_STATE.goal.progressDays;

    // Update progress bar
    if (this.elements.goalProgressFill) {
      this.elements.goalProgressFill.style.width = `${Math.min(progressPercent, 100)}%`;
    }

    // Update text - ADD GOAL STREAK
    if (this.elements.progressDays) {
      this.elements.progressDays.textContent = APP_STATE.goal.progressDays;
    }
    if (this.elements.totalDaysGoal) {
      this.elements.totalDaysGoal.textContent = APP_STATE.goal.totalDays;
    }
    if (this.elements.progressPercent) {
      const streakText =
        APP_STATE.goal.goalStreak > 0
          ? ` (${APP_STATE.goal.goalStreak}-day streak)`
          : "";
      this.elements.progressPercent.textContent = `${Math.min(progressPercent, 100).toFixed(1)}%${streakText}`;
    }
    if (this.elements.daysRemainingGoal) {
      this.elements.daysRemainingGoal.textContent = remainingDays;
    }

    // Update dates
    if (APP_STATE.goal.startDate && this.elements.startDate) {
      const start = new Date(APP_STATE.goal.startDate);
      this.elements.startDate.textContent = start.toLocaleDateString();
    }

    if (APP_STATE.goal.startDate && this.elements.completionDate) {
      const start = new Date(APP_STATE.goal.startDate);
      const completionDate = new Date(start);
      completionDate.setDate(
        completionDate.getDate() + APP_STATE.goal.totalDays,
      );
      this.elements.completionDate.textContent =
        completionDate.toLocaleDateString();
    }

    // ✅ NEW: Show goal streak warning if streak is at risk
    this.checkGoalStreakWarning();
  },

  // ✅ NEW: Check and show goal streak warning
  checkGoalStreakWarning() {
    const today = APP_STATE.getToday();
    const yesterday = APP_STATE.getYesterday();

    // Only show warning if user has a streak and hasn't tracked today
    if (APP_STATE.goal.goalStreak > 0 && !APP_STATE.goal.checkIns[today]) {
      // If last progress was yesterday, show "at risk" message
      if (APP_STATE.goal.lastProgressDate === yesterday) {
        this.showGoalMessage(
          `⚠️ Your ${APP_STATE.goal.goalStreak}-day goal streak is at risk! Track progress today to keep it alive.`,
          false,
          10000, // Show for 10 seconds
        );
      }
    }
  },

  // ... (rest of existing methods) ...
};
