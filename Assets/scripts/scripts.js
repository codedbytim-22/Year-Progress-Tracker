// DOM Elements
const dateDisplay = document.getElementById("dateDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const percentageDisplay = document.getElementById("percentageDisplay");
const progressText = document.getElementById("progressText");
const percentText = document.getElementById("percentText");
const yearLabel = document.getElementById("yearLabel");
const dayOfYear = document.getElementById("dayOfYear");
const daysRemaining = document.getElementById("daysRemaining");
const totalDays = document.getElementById("totalDays");
const seasonDropdown = document.getElementById("seasonDropdown");
const seasonName = document.getElementById("seasonName");
const seasonDates = document.getElementById("seasonDates");
const currentYear = document.getElementById("currentYear");
const versionInfo = document.getElementById("versionInfo");

// Theme Toggle Elements
const lightBulb = document.querySelector(".light-bulb");
const pullChain = document.querySelector(".pull-chain");
const themeToggle = document.getElementById("themeToggle");
const toggleSwitch = document.querySelector(".toggle-switch");

// App Configuration
const CONFIG = {
  VERSION: "1.4.0",
  UPDATE_INTERVAL: 1000,
  PERFORMANCE: {
    THROTTLE_ANIMATIONS: true,
    ANIMATION_DURATION: 800,
    REDUCED_MOTION: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  },
  THEME: {
    DARK: "dark",
    LIGHT: "light",
    STORAGE_KEY: "yearProgressTheme",
  },
  BACKGROUND: {
    PARTICLE_COUNT: 50,
    DATA_STREAMS: 4,
    GRID_SIZE: 40,
  },
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
  STREAK: {
    GRACE_PERIOD_HOURS: 36,
    TEST_MODE:
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1",
  },

  // NEW: Premium Configuration (Simplified)
  PREMIUM: {
    FREE_LIMITS: {
      MAX_GOALS: 1,
    },
    STORAGE_KEYS: {
      INTENT: "dayly_premium_intent",
    },
  },
};

// ============================================
// DATA SAFETY HELPER FUNCTIONS
// ============================================

function ensureDataSafety(storageKey, defaultValue) {
  try {
    const existing = localStorage.getItem(storageKey);
    if (!existing || existing === "undefined" || existing === "null") {
      localStorage.setItem(storageKey, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(existing);
  } catch (e) {
    console.error(`Data safety error for ${storageKey}:`, e);
    // Never reset existing data on error
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return JSON.parse(existing);
    } catch (e2) {
      // Last resort: use default but don't overwrite storage
      return defaultValue;
    }
    return defaultValue;
  }
}

function safeVersionUpdate() {
  const currentVersion = CONFIG.VERSION;
  const storedVersion = localStorage.getItem("dayly_app_version");

  if (!storedVersion || storedVersion !== currentVersion) {
    console.log(
      `Updating app version from ${storedVersion || "none"} to ${currentVersion}`,
    );
    localStorage.setItem("dayly_app_version", currentVersion);
  }
}

// ============================================
// PREMIUM INTENT TRACKING & MODAL SYSTEM
// ============================================

class PremiumSystem {
  constructor() {
    this.modal = document.getElementById("premiumModal");
    this.closeButton = document.getElementById("closePremiumModal");
    this.remindButton = document.getElementById("remindMeBtn");
    this.currentFeature = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupContextualTriggers();
  }

  setupEventListeners() {
    // Modal close button
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.closeModal());
    }

    // Remind me button
    if (this.remindButton) {
      this.remindButton.addEventListener("click", () => this.handleRemindMe());
    }

    // Close modal when clicking outside
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.modal &&
        this.modal.style.display === "flex"
      ) {
        this.closeModal();
      }
    });
  }

  setupContextualTriggers() {
    // 1. Multiple Goals Trigger - Already handled in EnhancedGoalTracker
    // 2. Yearly Wrapped Trigger - Add button to season section
    this.addYearlyWrappedButton();

    // 3. Advanced Analytics - Add to streak card
    this.addAnalyticsToStreakCard();

    // 4. Export/Share - Add to goal card
    this.addExportToGoalCard();
  }

  addYearlyWrappedButton() {
    // Add "Your Year in Review" button to seasons section
    const seasonSection = document.querySelector(".season-section");
    if (!seasonSection) return;

    const wrappedButton = document.createElement("button");
    wrappedButton.className = "premium-trigger-btn";
    wrappedButton.innerHTML = '<i class="fas fa-gift"></i> Your Year in Review';
    wrappedButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.handlePremiumIntent(
        "year_wrapped",
        "View your year in review with beautiful insights and shareable summaries.",
      );
    });

    // Add after season controls
    const seasonControls = seasonSection.querySelector(".season-controls");
    if (seasonControls) {
      seasonControls.appendChild(wrappedButton);
    }
  }

  addAnalyticsToStreakCard() {
    // Add analytics section to streak card
    const streakCard = document.querySelector(".streak-card");
    if (!streakCard) return;

    const analyticsSection = document.createElement("div");
    analyticsSection.className = "analytics-section premium-section";
    analyticsSection.innerHTML = `
      <h3><i class="fas fa-chart-line"></i> Advanced Analytics</h3>
      <div class="analytics-grid">
        <div class="analytics-item premium-locked" data-action="view_consistency">
          <div class="analytics-label">Consistency Score</div>
          <div class="analytics-value blurred">85%</div>
        </div>
        <div class="analytics-item premium-locked" data-action="view_best_days">
          <div class="analytics-label">Best Check-in Days</div>
          <div class="analytics-value blurred">Mon, Wed, Fri</div>
        </div>
        <div class="analytics-item premium-locked" data-action="view_trends">
          <div class="analytics-label">Progress Trends</div>
          <div class="analytics-value blurred">+12% weekly</div>
        </div>
      </div>
      <p class="premium-note"><i class="fas fa-lock"></i> Unlock with Premium</p>
    `;

    // Add after streak grid
    const streakGrid = streakCard.querySelector(".streak-grid");
    if (streakGrid) {
      streakGrid.parentNode.insertBefore(
        analyticsSection,
        streakGrid.nextSibling,
      );
    }

    // Add click handlers to analytics items
    const lockedItems = analyticsSection.querySelectorAll(".premium-locked");
    lockedItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.handlePremiumIntent(
          "analytics",
          "Get deep insights into your consistency patterns, productivity trends, and achievement rates.",
        );
      });
    });
  }

  addExportToGoalCard() {
    // Add export buttons to goal card
    const goalCard = document.querySelector(".goal-card");
    if (!goalCard) return;

    const exportSection = document.createElement("div");
    exportSection.className = "export-section premium-section";
    exportSection.innerHTML = `
      <div class="export-buttons">
        <button class="premium-trigger-btn" data-action="export_progress">
          <i class="fas fa-download"></i> Export Progress
        </button>
        <button class="premium-trigger-btn" data-action="share_card">
          <i class="fas fa-share-alt"></i> Generate Share Card
        </button>
      </div>
    `;

    // Add after goal details
    const goalDetails = goalCard.querySelector(".goal-details");
    if (goalDetails) {
      goalDetails.parentNode.insertBefore(
        exportSection,
        goalDetails.nextSibling,
      );
    }

    // Add click handlers
    const exportButtons = exportSection.querySelectorAll(
      ".premium-trigger-btn",
    );
    exportButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const action = button.dataset.action;
        const description =
          action === "export_progress"
            ? "Download your data in multiple formats (CSV, PDF, JSON) for personal tracking."
            : "Create beautiful, shareable progress cards for social media or personal motivation.";
        this.handlePremiumIntent("export", description);
      });
    });
  }

  handlePremiumIntent(feature, description) {
    // Track the intent
    this.trackPremiumIntent(feature);

    // Show premium modal with feature-specific content
    this.showPremiumModal(feature, description);
  }

  trackPremiumIntent(feature) {
    const intents = ensureDataSafety(CONFIG.PREMIUM.STORAGE_KEYS.INTENT, []);

    intents.push({
      feature: feature,
      timestamp: Date.now(),
      version: CONFIG.VERSION,
    });

    // Keep only last 100 intents
    if (intents.length > 100) {
      intents.splice(0, intents.length - 100);
    }

    localStorage.setItem(
      CONFIG.PREMIUM.STORAGE_KEYS.INTENT,
      JSON.stringify(intents),
    );

    console.log(
      `Premium intent tracked: ${feature} (Total: ${intents.length})`,
    );
  }

  showPremiumModal(feature, description) {
    this.currentFeature = feature;

    // Update modal content based on feature
    this.updateModalContent(feature, description);

    // Show modal
    if (this.modal) {
      this.modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Animate in
      setTimeout(() => {
        this.modal.classList.add("show");
      }, 10);
    }
  }

  updateModalContent(feature, description) {
    const featureTitle = this.getFeatureTitle(feature);
    const featureHighlight = document.getElementById("premiumFeatureHighlight");

    if (featureHighlight) {
      featureHighlight.innerHTML = `
        <div class="feature-icon-large">
          <i class="${this.getFeatureIcon(feature)}"></i>
        </div>
        <h3>${featureTitle}</h3>
        <p class="feature-description">${description}</p>
        <div class="feature-status">
          <i class="fas fa-lock"></i>
          <span>Premium Feature</span>
        </div>
      `;
    }
  }

  getFeatureTitle(feature) {
    const titles = {
      multiple_goals: "Multiple Goals",
      year_wrapped: "Yearly Wrapped",
      analytics: "Advanced Analytics",
      export: "Export & Share",
      cloud_sync: "Cloud Sync",
    };
    return titles[feature] || "Premium Feature";
  }

  getFeatureIcon(feature) {
    const icons = {
      multiple_goals: "fas fa-bullseye",
      year_wrapped: "fas fa-gift",
      analytics: "fas fa-chart-line",
      export: "fas fa-download",
      cloud_sync: "fas fa-cloud",
    };
    return icons[feature] || "fas fa-crown";
  }

  handleRemindMe() {
    // Store remind me preference
    const reminders = ensureDataSafety("dayly_premium_reminders", []);

    reminders.push({
      timestamp: Date.now(),
      feature: this.currentFeature,
      reminded: true,
      appVersion: CONFIG.VERSION,
    });

    localStorage.setItem("dayly_premium_reminders", JSON.stringify(reminders));

    // Show confirmation
    const remindButton = this.remindButton;
    if (remindButton) {
      const originalHTML = remindButton.innerHTML;
      remindButton.innerHTML = '<i class="fas fa-check"></i> Notified!';
      remindButton.disabled = true;

      setTimeout(() => {
        remindButton.innerHTML = originalHTML;
        remindButton.disabled = false;
      }, 3000);
    }

    // Close modal after a delay
    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("show");

      setTimeout(() => {
        this.modal.style.display = "none";
        document.body.style.overflow = "auto";
      }, 300);
    }
  }
}

// ============================================
// ENHANCED GOAL TRACKER (Updated for Contextual Premium)
// ============================================

class EnhancedGoalTracker {
  constructor() {
    this.storageKey = "dayly_enhanced_goal";
    this.data = this.loadData();
    this.lastMotivationalMessage = 0;
    this.MOTIVATION_COOLDOWN = 7 * 24 * 60 * 60 * 1000;
    this.init();
    console.log("Enhanced Goal Tracker initialized");
  }

  loadData() {
    const defaultData = {
      version: "1.0",
      goals: [],
      activeGoalIndex: 0,
      title: "",
      description: "",
      startDate: null,
      targetDate: null,
      progressDays: 0,
      totalDays: 90,
      checkIns: {},
      completed: false,
      completedDate: null,
      milestones: [],
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return defaultData;

      const parsed = JSON.parse(saved);

      // Migration: Convert single goal to array format
      if (parsed.title && (!parsed.goals || !Array.isArray(parsed.goals))) {
        parsed.goals = [
          {
            id: "goal_1",
            title: parsed.title,
            description: parsed.description || "",
            startDate: parsed.startDate,
            targetDate: parsed.targetDate,
            progressDays: parsed.progressDays,
            totalDays: parsed.totalDays,
            checkIns: parsed.checkIns || {},
            completed: parsed.completed || false,
            completedDate: parsed.completedDate,
            milestones: parsed.milestones || [],
            createdAt: new Date().toISOString(),
            isActive: true,
          },
        ];
        parsed.activeGoalIndex = 0;
        parsed.version = "1.1";

        // Save migrated data
        setTimeout(() => this.saveData(parsed), 100);
      }

      return parsed;
    } catch (e) {
      console.error("Error loading goal data:", e);
      return defaultData;
    }
  }

  saveData(data = this.data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving goal data:", e);
      this.showMessage(
        "Failed to save goal data. Please refresh the page.",
        "error",
      );
    }
  }

  init() {
    this.setupUI();
    this.updateDisplay();
    this.setupEventListeners();
    this.checkForWeeklyMotivation();
  }

  setupUI() {
    const currentGoal = this.getCurrentGoal();
    const hasGoal = currentGoal && currentGoal.title;

    const goalDisplay = document.getElementById("goalDisplay");
    const goalSetup = document.getElementById("goalSetup");
    const progressButton = document.getElementById("progressButton");

    if (goalDisplay && goalSetup && progressButton) {
      if (hasGoal) {
        goalDisplay.style.display = "block";
        goalSetup.style.display = "none";
        progressButton.disabled = false;
      } else {
        goalDisplay.style.display = "none";
        goalSetup.style.display = "block";
        progressButton.disabled = true;
      }
    }

    // Update goal check-in button visibility
    if (window.enhancedStreakSystem) {
      window.enhancedStreakSystem.showGoalCheckInButton();
    }
  }

  getCurrentGoal() {
    // If using new array format
    if (
      this.data.goals &&
      Array.isArray(this.data.goals) &&
      this.data.goals.length > 0
    ) {
      if (
        this.data.activeGoalIndex >= 0 &&
        this.data.activeGoalIndex < this.data.goals.length
      ) {
        return this.data.goals[this.data.activeGoalIndex];
      }
      return this.data.goals[0];
    }

    // Fallback to old single goal structure
    return {
      title: this.data.title,
      description: this.data.description,
      startDate: this.data.startDate,
      targetDate: this.data.targetDate,
      progressDays: this.data.progressDays,
      totalDays: this.data.totalDays,
      checkIns: this.data.checkIns,
      completed: this.data.completed,
      completedDate: this.data.completedDate,
      milestones: this.data.milestones,
    };
  }

  setupEventListeners() {
    // Edit goal button
    const editButton = document.getElementById("editGoalButton");
    if (editButton) {
      editButton.addEventListener("click", () => {
        this.showGoalSetup();
      });
    }

    // Save goal button - check for limits before saving
    const saveButton = document.getElementById("saveGoalButton");
    if (saveButton) {
      saveButton.addEventListener("click", () => {
        this.saveGoal();
      });
    }

    // Progress button
    const progressButton = document.getElementById("progressButton");
    if (progressButton) {
      progressButton.addEventListener("click", () => {
        this.recordProgress();
      });
    }

    // Duration selector
    const durationSelect = document.getElementById("goalDuration");
    if (durationSelect) {
      durationSelect.addEventListener("change", (e) => {
        const customDuration = document.getElementById("customDuration");
        if (customDuration) {
          if (e.target.value === "custom") {
            customDuration.style.display = "block";
          } else {
            customDuration.style.display = "none";
          }
        }
      });
    }
  }

  showGoalSetup() {
    const goalDisplay = document.getElementById("goalDisplay");
    const goalSetup = document.getElementById("goalSetup");

    if (goalDisplay && goalSetup) {
      goalDisplay.style.display = "none";
      goalSetup.style.display = "block";

      // Pre-fill if editing
      const currentGoal = this.getCurrentGoal();
      if (currentGoal.title) {
        const goalInput = document.getElementById("goalInput");
        const goalDescription = document.getElementById("goalDescription");
        const goalDuration = document.getElementById("goalDuration");

        if (goalInput) goalInput.value = currentGoal.title;
        if (goalDescription)
          goalDescription.value = currentGoal.description || "";
        if (goalDuration) goalDuration.value = currentGoal.totalDays.toString();
      }
    }
  }

  saveGoal() {
    // Check if we're at the free limit
    const currentGoals = this.data.goals?.length || (this.data.title ? 1 : 0);
    if (currentGoals >= CONFIG.PREMIUM.FREE_LIMITS.MAX_GOALS) {
      // Show premium modal
      if (window.premiumSystem) {
        window.premiumSystem.handlePremiumIntent(
          "multiple_goals",
          "Track multiple areas of your life simultaneously - fitness, learning, career, and personal growth.",
        );
      }
      return;
    }

    const goalInput = document.getElementById("goalInput");
    const descriptionInput = document.getElementById("goalDescription");
    const durationSelect = document.getElementById("goalDuration");

    if (!goalInput || !durationSelect) {
      this.showMessage("Form elements not found!", "error");
      return;
    }

    const title = goalInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : "";

    if (!title) {
      this.showMessage("Please enter a goal!", "error");
      return;
    }

    let totalDays;
    if (durationSelect.value === "custom") {
      const customDaysInput = document.getElementById("customDays");
      totalDays = customDaysInput ? parseInt(customDaysInput.value) || 90 : 90;
      totalDays = Math.max(7, Math.min(730, totalDays));
    } else {
      totalDays = parseInt(durationSelect.value);
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Calculate target date
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + totalDays);

    // Create new goal object
    const newGoal = {
      id: "goal_" + Date.now(),
      title: title,
      description: description,
      startDate: todayStr,
      targetDate: targetDate.toISOString().split("T")[0],
      progressDays: 0,
      totalDays: totalDays,
      checkIns: {},
      completed: false,
      completedDate: null,
      milestones: this.generateMilestones(totalDays),
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Initialize goals array if it doesn't exist
    if (!this.data.goals || !Array.isArray(this.data.goals)) {
      this.data.goals = [];
    }

    // Deactivate previous goals
    this.data.goals.forEach((goal) => (goal.isActive = false));

    // Add new goal
    this.data.goals.push(newGoal);
    this.data.activeGoalIndex = this.data.goals.length - 1;

    // Keep backward compatibility for single goal view
    this.data.title = title;
    this.data.description = description;
    this.data.startDate = todayStr;
    this.data.targetDate = targetDate.toISOString().split("T")[0];
    this.data.progressDays = 0;
    this.data.totalDays = totalDays;
    this.data.checkIns = {};
    this.data.completed = false;
    this.data.completedDate = null;
    this.data.milestones = this.generateMilestones(totalDays);

    this.saveData();
    this.setupUI();
    this.updateDisplay();

    this.showMessage(
      `🎯 Goal set! "${title}" for ${totalDays} days. Target: ${targetDate.toLocaleDateString()}`,
      "info",
    );

    // Show goal check-in button
    if (window.enhancedStreakSystem) {
      window.enhancedStreakSystem.showGoalCheckInButton();
    }
  }

  generateMilestones(totalDays) {
    const milestones = [];
    const milestonePoints = [0.25, 0.5, 0.75, 0.9];

    milestonePoints.forEach((point) => {
      const day = Math.floor(totalDays * point);
      if (day > 0) {
        milestones.push({
          day: day,
          achieved: false,
          message: this.getMilestoneMessage(point),
          achievedDate: null,
        });
      }
    });

    return milestones;
  }

  getMilestoneMessage(percentage) {
    const messages = {
      0.25: "First quarter down! You're building momentum!",
      0.5: "Halfway there! You've come so far!",
      0.75: "Three quarters complete! Almost there!",
      0.9: "Final stretch! You've got this!",
    };
    return messages[percentage] || `Milestone reached!`;
  }

  showDailyGoalMotivation() {
    const msgEl = document.getElementById("motivationalMessage");
    if (!msgEl) return;

    const currentGoal = this.getCurrentGoal();
    if (!currentGoal) return;

    // Format the target date nicely
    let targetDateDisplay = "the end of the set period";
    if (currentGoal.targetDate) {
      const targetDate = new Date(currentGoal.targetDate);
      targetDateDisplay = targetDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    const motivationalMessage = `You are doing well, keep this up and you shall achieve your goal by ${targetDateDisplay} - keep it up champ!`;

    msgEl.textContent = motivationalMessage;
    msgEl.className = "motivational-message motivation";
    msgEl.classList.add("show");

    setTimeout(() => {
      msgEl.classList.remove("show");
    }, 8000);
  }

  recordProgress() {
    const currentGoal = this.getCurrentGoal();
    if (!currentGoal || currentGoal.completed) return;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Check if already recorded today
    if (currentGoal.checkIns && currentGoal.checkIns[todayStr]) {
      this.showMessage("Already recorded progress today! Great job!", "info");
      return;
    }

    // Record progress
    if (!currentGoal.checkIns) currentGoal.checkIns = {};
    currentGoal.checkIns[todayStr] = {
      notes: "",
      timestamp: Date.now(),
    };
    currentGoal.progressDays++;

    // Update in the goals array if using new format
    if (this.data.goals && Array.isArray(this.data.goals)) {
      const goalIndex = this.data.goals.findIndex(
        (g) => g.id === currentGoal.id,
      );
      if (goalIndex !== -1) {
        this.data.goals[goalIndex] = currentGoal;
      }
    }

    // Update backward compatibility fields
    this.data.progressDays = currentGoal.progressDays;
    this.data.checkIns = currentGoal.checkIns;

    // Check milestones
    this.checkMilestones(currentGoal);

    // Check if goal completed
    if (
      currentGoal.progressDays >= currentGoal.totalDays &&
      !currentGoal.completed
    ) {
      this.completeGoal(currentGoal);
      return;
    }

    this.saveData();
    this.updateDisplay();

    // Show the daily motivational message
    this.showDailyGoalMotivation();

    // Visual feedback
    this.animateProgressUpdate();

    // Don't show the weekly motivation if we just showed daily
    this.lastMotivationalMessage = Date.now();
  }

  checkMilestones(goal) {
    goal.milestones.forEach((milestone) => {
      if (!milestone.achieved && goal.progressDays >= milestone.day) {
        milestone.achieved = true;
        milestone.achievedDate = new Date().toISOString();
        this.showMessage(`🏆 ${milestone.message}`, "milestone");
      }
    });
  }

  completeGoal(goal) {
    goal.completed = true;
    goal.completedDate = new Date().toISOString();

    // Update in the goals array if using new format
    if (this.data.goals && Array.isArray(this.data.goals)) {
      const goalIndex = this.data.goals.findIndex((g) => g.id === goal.id);
      if (goalIndex !== -1) {
        this.data.goals[goalIndex] = goal;
      }
    }

    // Update backward compatibility
    this.data.completed = true;
    this.data.completedDate = goal.completedDate;

    this.saveData();
    this.updateDisplay();

    this.showMessage(
      `🎉 CONGRATULATIONS! You completed "${goal.title}" in ${goal.progressDays} days!`,
      "celebration",
    );

    // Trigger celebration animation
    this.triggerCelebration();

    // Disable progress button
    const progressButton = document.getElementById("progressButton");
    if (progressButton) {
      progressButton.disabled = true;
      progressButton.innerHTML =
        '<i class="fas fa-trophy"></i> Goal Completed!';
    }
  }

  // ... rest of the methods remain the same as before ...

  checkForWeeklyMotivation(forceCheck = false) {
    const currentGoal = this.getCurrentGoal();
    if (!currentGoal || currentGoal.progressDays === 0) return;

    const now = Date.now();
    const shouldShow =
      forceCheck ||
      now - this.lastMotivationalMessage > this.MOTIVATION_COOLDOWN;

    if (shouldShow && currentGoal.progressDays > 0) {
      const weekNumber = Math.floor(currentGoal.progressDays / 7);
      if (weekNumber > 0) {
        const messages = [
          `🔥 Week ${weekNumber} in the books! ${this.getPaceMessage(currentGoal)}`,
          `🎯 ${currentGoal.progressDays} days of consistent effort! ${this.getCompletionEstimate(currentGoal)}`,
          `💪 You're ${((currentGoal.progressDays / currentGoal.totalDays) * 100).toFixed(1)}% to your goal!`,
          `🚀 At this pace, you'll reach your goal by ${this.getProjectedDate(currentGoal)}.`,
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        this.showMessage(randomMsg, "motivation");
        this.lastMotivationalMessage = now;
      }
    }
  }

  getPaceMessage(goal) {
    const daysCompleted = goal.progressDays;
    const expectedDays = this.getExpectedDays(goal);

    if (daysCompleted > expectedDays) {
      return "You're ahead of schedule!";
    } else if (daysCompleted < expectedDays) {
      return "Keep going, you're making progress!";
    } else {
      return "Right on track!";
    }
  }

  getExpectedDays(goal) {
    if (!goal.startDate) return 0;
    const start = new Date(goal.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCompletionEstimate(goal) {
    if (goal.completed) return "Goal completed!";

    const remaining = goal.totalDays - goal.progressDays;
    const dailyRate =
      goal.progressDays / Math.max(1, this.getExpectedDays(goal));

    if (dailyRate > 0) {
      const daysToComplete = Math.ceil(remaining / dailyRate);
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + daysToComplete);
      return `Estimated completion: ${completionDate.toLocaleDateString()}`;
    }

    return "Start tracking to see your completion date!";
  }

  getProjectedDate(goal) {
    if (!goal.startDate) return "soon";

    const start = new Date(goal.startDate);
    const projected = new Date(start);
    projected.setDate(projected.getDate() + goal.totalDays);

    return projected.toLocaleDateString();
  }

  animateProgressUpdate() {
    const button = document.getElementById("progressButton");
    const fill = document.getElementById("goalProgressFill");

    if (button) {
      button.classList.add("check-in-pulse");
      setTimeout(() => button.classList.remove("check-in-pulse"), 500);
    }

    if (fill) {
      // Add a subtle glow effect
      fill.classList.add("celebrating");
      setTimeout(() => {
        fill.classList.remove("celebrating");
      }, 1000);
    }
  }

  triggerCelebration() {
    // Add celebration confetti
    const container = document.querySelector(".goal-card");
    if (container) {
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const confetti = document.createElement("div");
          confetti.className = "confetti-particle";

          const colors = ["#4361ee", "#4cc9f0", "#00ff88", "#fbbf24"];
          const color = colors[i % colors.length];

          const angle = Math.random() * Math.PI * 2;
          const distance = 100 + Math.random() * 200;

          confetti.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            top: 50%;
            left: 50%;
            z-index: 100;
            animation: confettiFall ${0.5 + Math.random() * 1}s ease-out forwards;
            --angle: ${angle};
            --distance: ${distance};
          `;

          container.appendChild(confetti);

          setTimeout(() => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          }, 2000);
        }, i * 50);
      }
    }
  }

  updateDisplay() {
    const currentGoal = this.getCurrentGoal();
    if (!currentGoal || !currentGoal.title) return;

    // Update all elements
    const elements = {
      title: document.getElementById("goalTitle"),
      progressDays: document.getElementById("goalProgressDays"),
      totalDays: document.getElementById("goalTotalDays"),
      progressPercent: document.getElementById("goalProgressPercent"),
      startDate: document.getElementById("goalStartDate"),
      daysRemaining: document.getElementById("goalDaysRemaining"),
      completionDate: document.getElementById("goalCompletionDate"),
      progressFill: document.getElementById("goalProgressFill"),
    };

    // Update each element if it exists
    if (elements.title) {
      elements.title.textContent = currentGoal.title;
      if (currentGoal.completed) {
        elements.title.innerHTML += ' <span style="color: #00ff88;">✓</span>';
      }
    }

    if (elements.progressDays)
      elements.progressDays.textContent = currentGoal.progressDays;
    if (elements.totalDays)
      elements.totalDays.textContent = currentGoal.totalDays;

    const progressPercent =
      (currentGoal.progressDays / currentGoal.totalDays) * 100;
    if (elements.progressPercent) {
      elements.progressPercent.textContent = `${Math.min(progressPercent, 100).toFixed(1)}%`;
    }

    if (elements.startDate && currentGoal.startDate) {
      const start = new Date(currentGoal.startDate);
      elements.startDate.textContent = start.toLocaleDateString();
    }

    const remaining = Math.max(
      0,
      currentGoal.totalDays - currentGoal.progressDays,
    );
    if (elements.daysRemaining) elements.daysRemaining.textContent = remaining;

    if (elements.completionDate && currentGoal.targetDate) {
      const target = new Date(currentGoal.targetDate);
      elements.completionDate.textContent = target.toLocaleDateString();
    }

    if (elements.progressFill) {
      elements.progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
    }
  }

  showMessage(text, type = "info") {
    const msgEl = document.getElementById("motivationalMessage");
    if (!msgEl) return;

    msgEl.textContent = text;
    msgEl.className = `motivational-message ${type}`;
    msgEl.classList.add("show");

    setTimeout(() => {
      msgEl.classList.remove("show");
    }, 5000);
  }
}

// ============================================
// ENHANCED DAILY STREAK SYSTEM (Remains mostly same)
// ============================================

class EnhancedDailyStreak {
  constructor() {
    this.storageKey = "dayly_enhanced_streak";
    this.data = this.loadData();
    this.init();
    console.log("Enhanced Daily Streak initialized");
  }

  loadData() {
    const defaultData = {
      streak: 0,
      lastCheckIn: null,
      checkIns: {},
      streakHistory: [],
      longestStreak: 0,
      totalCheckIns: 0,
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : defaultData;
    } catch (e) {
      console.error("Error loading streak data:", e);
      return defaultData;
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error("Error saving streak data:", e);
      this.showMessage(
        "Failed to save streak data. Please refresh the page.",
        "error",
      );
    }
  }

  init() {
    this.updateStreakGrid();
    this.setupCheckInButtons();
    this.updateDisplay();
    this.checkForMissedDays();
    this.showGoalCheckInButton();
  }

  // ... rest of the streak methods remain the same as before ...

  checkIn(type = "showed_up") {
    const today = new Date();
    const todayStr = this.formatDate(today);
    const yesterdayStr = this.formatDate(new Date(today.getTime() - 86400000));

    console.log(`Check-in attempt: ${type} for ${todayStr}`);

    // Check if already checked in today
    if (this.data.checkIns[todayStr]) {
      this.showMessage("Already checked in today! Come back tomorrow.", "info");
      return;
    }

    // Record check-in with timestamp and type
    this.data.checkIns[todayStr] = {
      type: type,
      timestamp: Date.now(),
    };
    this.data.totalCheckIns++;

    // Update streak logic
    if (this.data.lastCheckIn === yesterdayStr) {
      // Consecutive day
      this.data.streak++;
      this.showMessage(
        `🔥 Day ${this.data.streak}! ${type === "worked_toward_goal" ? "Great work on your goal!" : "Keep the streak going!"}`,
        "success",
      );
    } else if (!this.data.lastCheckIn || this.data.lastCheckIn < yesterdayStr) {
      // First check-in or streak was already broken
      if (this.data.streak > 0) {
        // Save the completed streak to history
        this.saveStreakToHistory();
      }
      this.data.streak = 1;
      this.showMessage(
        type === "worked_toward_goal"
          ? "🎯 First day working toward your goal!"
          : "🎉 First day! Your streak begins!",
        "success",
      );
    }

    // Update longest streak
    if (this.data.streak > this.data.longestStreak) {
      this.data.longestStreak = this.data.streak;
    }

    this.data.lastCheckIn = todayStr;
    this.saveData();
    this.updateStreakGrid();
    this.updateDisplay();

    // Visual feedback
    this.animateCheckIn(type);

    // If this was a goal check-in, also record goal progress
    if (type === "worked_toward_goal" && window.enhancedGoalTracker) {
      window.enhancedGoalTracker.recordProgress();
    }
  }

  animateCheckIn(type) {
    const button = document.getElementById("checkInButton");
    if (button) {
      const originalHTML = button.innerHTML;

      if (type === "showed_up") {
        // Change to "You showed up today!" message
        button.innerHTML = `<i class="fas fa-check-circle"></i> You showed up today!`;
        button.style.background = "linear-gradient(135deg, #40c463, #30a14e)";
        button.disabled = true;

        // Disable for 24 hours (in production) or 30 seconds (for testing)
        const disableTime = CONFIG.STREAK.TEST_MODE
          ? 30000
          : 24 * 60 * 60 * 1000;

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.background = "linear-gradient(135deg, #ff6b6b, #ffa726)";
          button.disabled = false;
        }, disableTime);
      } else if (type === "worked_toward_goal") {
        // For goal check-in
        button.innerHTML = `<i class="fas fa-bullseye"></i> Goal progress recorded!`;
        button.style.background = "linear-gradient(135deg, #4361ee, #3a0ca3)";
        button.disabled = true;

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.background = "linear-gradient(135deg, #ff6b6b, #ffa726)";
          button.disabled = false;
        }, 3000);
      }
    }
  }

  // ... rest of the streak methods ...

  showMessage(text, type = "info") {
    const msgEl = document.getElementById("streakMessage");
    if (!msgEl) return;

    msgEl.textContent = text;
    msgEl.className = `streak-message ${type}`;
    msgEl.classList.add("show");

    setTimeout(() => {
      msgEl.classList.remove("show");
    }, 5000);
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
}

// ============================================
// INITIALIZATION
// ============================================

let backgroundSystem;
let themeManager;
let updateInterval;

function enhancedInit() {
  console.log(`DAYLY Progress Tracker v${CONFIG.VERSION} initializing...`);

  // Check for safe version update
  safeVersionUpdate();

  // Initialize background system
  backgroundSystem = new BackgroundSystem();

  // Initialize theme manager with background system
  themeManager = new ThemeManager(backgroundSystem);

  // Initialize enhanced systems
  window.enhancedStreakSystem = new EnhancedDailyStreak();
  window.enhancedGoalTracker = new EnhancedGoalTracker();

  // Initialize feedback system
  window.feedbackSystem = new FeedbackSystem();

  // Initialize premium system (contextual triggers)
  window.premiumSystem = new PremiumSystem();

  // Set version info
  versionInfo.textContent = `v${CONFIG.VERSION}`;

  // Set initial progress text with percentage
  const now = new Date();
  const initialProgress = calculateProgress(now);

  progressText.textContent = `${initialProgress.year} is ${initialProgress.progress.toFixed(2)}% complete`;

  // Set up updates
  updateInterval = setInterval(updateDateTime, CONFIG.UPDATE_INTERVAL);

  // Set up year progress updates
  setInterval(updateYearProgress, CONFIG.UPDATE_INTERVAL * 60);

  // Event listeners
  seasonDropdown.addEventListener("change", () => {
    updateDateTime();
  });

  // Configure animations
  progressBar.style.transition = `width ${CONFIG.PERFORMANCE.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

  // Animate toggle switch
  animateToggleSwitch();

  // Initial update
  updateDateTime();

  // Setup performance monitoring if enabled
  if (CONFIG.PERFORMANCE.THROTTLE_ANIMATIONS) {
    setupPerformanceMonitoring();
  }

  console.log("App initialized successfully");

  // Handle performance updates
  window.addEventListener("resize", handleResize);
}

// ... rest of the initialization functions remain the same ...

// Add CSS for the new contextual premium elements
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
/* Premium contextual triggers */
.premium-trigger-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  width: 100%;
  justify-content: center;
}

.premium-trigger-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.premium-section {
  margin-top: 20px;
  padding: 16px;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.premium-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.premium-section h3 i {
  color: #8b5cf6;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.analytics-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analytics-item:hover {
  background: rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}

.analytics-item.premium-locked {
  position: relative;
}

.analytics-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.analytics-value.blurred {
  filter: blur(4px);
  user-select: none;
  color: var(--text-muted);
}

.premium-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.premium-note i {
  color: #8b5cf6;
}

.export-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.export-buttons .premium-trigger-btn {
  flex: 1;
  margin: 0;
}

/* Update premium modal styling */
.feature-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  margin-top: 12px;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 500;
}

.feature-status i {
  font-size: 12px;
}

.feature-description {
  color: var(--text-muted);
  line-height: 1.5;
  margin: 12px 0;
}
</style>
`,
);
