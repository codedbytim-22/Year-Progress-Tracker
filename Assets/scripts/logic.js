// Assets/scripts/logic.js - UPDATED

const APP_LOGIC = {
  // ... (existing date utilities and streak logic) ...

  // Goal logic - UPDATED with streak reset
  processGoalProgress() {
    const today = APP_STATE.getToday();
    const yesterday = APP_STATE.getYesterday();

    // Check if goal exists
    if (!APP_STATE.goal.title || !APP_STATE.goal.startDate) {
      return { success: false, message: "No goal set!" };
    }

    // Check if already recorded today
    if (APP_STATE.goal.checkIns[today]) {
      return { success: false, message: "Already recorded progress today!" };
    }

    // ✅ NEW: Check if missed previous day (goal streak reset logic)
    let streakMessage = "";
    if (!APP_STATE.goal.lastProgressDate) {
      // First progress ever
      APP_STATE.goal.goalStreak = 1;
      streakMessage = "First day of your goal streak!";
    } else if (APP_STATE.goal.lastProgressDate === yesterday) {
      // Consecutive day - streak continues
      APP_STATE.goal.goalStreak++;
      streakMessage = `🔥 Goal streak: ${APP_STATE.goal.goalStreak} days!`;
    } else if (APP_STATE.goal.lastProgressDate === today) {
      // Already recorded today (shouldn't reach here)
      return { success: false, message: "Already recorded progress today!" };
    } else {
      // ✅ MISSED ONE OR MORE DAYS - RESET PROGRESS TO ZERO
      const lastDate = new Date(APP_STATE.goal.lastProgressDate);
      const daysMissed = APP_STATE.daysBetween(
        APP_STATE.goal.lastProgressDate,
        today,
      );

      // Reset progress to zero
      APP_STATE.goal.progressDays = 0;
      APP_STATE.goal.checkIns = {}; // Clear all check-ins
      APP_STATE.goal.goalStreak = 1; // Start new streak

      // Keep the original start date for the goal
      // APP_STATE.goal.startDate remains the same

      streakMessage = `💔 Missed ${daysMissed} day(s) of goal tracking. Progress reset to 0. Starting fresh!`;
    }

    // Update progress
    APP_STATE.goal.checkIns[today] = true;
    APP_STATE.goal.progressDays++;
    APP_STATE.goal.lastProgressDate = today;

    // Update longest goal streak
    if (APP_STATE.goal.goalStreak > APP_STATE.goal.longestGoalStreak) {
      APP_STATE.goal.longestGoalStreak = APP_STATE.goal.goalStreak;
    }

    let message = `✅ Day ${APP_STATE.goal.progressDays} recorded! ${streakMessage}`;

    // Check if goal completed
    if (APP_STATE.goal.progressDays >= APP_STATE.goal.totalDays) {
      APP_STATE.goal.completed = true;
      message = `🎉 CONGRATULATIONS! You completed your goal: "${APP_STATE.goal.title}" with a ${APP_STATE.goal.goalStreak}-day streak!`;
    }

    APP_STATE.saveGoal();

    return {
      success: true,
      message,
      progressDays: APP_STATE.goal.progressDays,
      totalDays: APP_STATE.goal.totalDays,
      goalStreak: APP_STATE.goal.goalStreak,
      completed: APP_STATE.goal.completed,
    };
  },

  // ✅ NEW: Check goal streak reset on page load
  checkGoalStreakReset() {
    const today = APP_STATE.getToday();

    // If no goal or never tracked progress, do nothing
    if (!APP_STATE.goal.title || !APP_STATE.goal.lastProgressDate) return;

    // If last progress was today, streak is fine
    if (APP_STATE.goal.lastProgressDate === today) return;

    const daysDiff = APP_STATE.daysBetween(
      APP_STATE.goal.lastProgressDate,
      today,
    );

    console.log(`Days since last goal progress: ${daysDiff}`);

    // If missed more than 1 day, reset progress
    if (daysDiff > 1) {
      console.log(`Goal progress reset: Missed ${daysDiff} days`);
      APP_STATE.goal.progressDays = 0;
      APP_STATE.goal.checkIns = {};
      APP_STATE.goal.goalStreak = 0;
      APP_STATE.goal.completed = false;
      APP_STATE.saveGoal();
    }
  },

  // ... (existing setGoal method) ...

  setGoal(title, totalDays) {
    APP_STATE.goal = {
      title: title,
      startDate: APP_STATE.getToday(),
      progressDays: 0,
      totalDays: totalDays,
      checkIns: {},
      completed: false,
      lastProgressDate: null, // NEW
      goalStreak: 0, // NEW
      longestGoalStreak: 0, // NEW
    };

    APP_STATE.saveGoal();

    return {
      success: true,
      message: `🎯 Goal set! "${title}" for ${totalDays} days. Track daily to keep your progress!`,
    };
  },

  // ... (rest of existing methods) ...
};
