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
  VERSION: "1.4.0", // Updated version for premium features
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

  // NEW: Premium Configuration
  PREMIUM: {
    // Limits for free tier
    FREE_LIMITS: {
      MAX_GOALS: 1,
      MAX_EXPORTS: 0,
      HAS_WRAPPED: false,
      HAS_ANALYTICS: false,
      HAS_CLOUD_SYNC: false,
      HAS_CUSTOM_THEMES: false,
    },

    // Premium tier limits (for future)
    PREMIUM_LIMITS: {
      MAX_GOALS: Infinity,
      MAX_EXPORTS: Infinity,
      HAS_WRAPPED: true,
      HAS_ANALYTICS: true,
      HAS_CLOUD_SYNC: true,
      HAS_CUSTOM_THEMES: true,
    },

    // Fake door settings
    FAKE_DOOR: {
      ENABLED: true,
      TRACK_CLICKS: true,
      SHOW_WAITLIST: true,
    },

    // Storage keys
    STORAGE_KEYS: {
      CLICKS: "dayly_premium_clicks",
      WAITLIST: "dayly_premium_waitlist",
      REMINDERS: "dayly_premium_reminders",
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

  // If no version stored or version is different, update
  if (!storedVersion || storedVersion !== currentVersion) {
    console.log(
      `Updating app version from ${storedVersion || "none"} to ${currentVersion}`,
    );

    // Store current version
    localStorage.setItem("dayly_app_version", currentVersion);

    // You can add version-specific migrations here if needed
    // For example: migrate data from v1.3.0 to v1.4.0

    // Track this as an update event
    const updates = ensureDataSafety("dayly_app_updates", []);
    updates.push({
      fromVersion: storedVersion,
      toVersion: currentVersion,
      timestamp: Date.now(),
    });

    // Keep only last 10 updates
    if (updates.length > 10) {
      updates.splice(0, updates.length - 10);
    }

    localStorage.setItem("dayly_app_updates", JSON.stringify(updates));
  }
}

// ============================================
// PREMIUM FAKE-DOOR SYSTEM
// ============================================

class PremiumSystem {
  constructor() {
    this.modal = document.getElementById("premiumModal");
    this.closeButton = document.getElementById("closePremiumModal");
    this.cancelButton = document.getElementById("cancelPremium");
    this.remindButton = document.getElementById("remindMeBtn");
    this.premiumPill = document.getElementById("premiumPillBtn");
    this.featureHighlight = document.getElementById("premiumFeatureHighlight");
    this.currentFeature = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPremiumLockButtons();
    this.updateGoalLimitDisplay();
  }

  setupEventListeners() {
    // Modal close button
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.closeModal());
    }

    // Cancel button
    if (this.cancelButton) {
      this.cancelButton.addEventListener("click", () => this.closeModal());
    }

    // Remind me button
    if (this.remindButton) {
      this.remindButton.addEventListener("click", () => this.handleRemindMe());
    }

    // Premium pill button
    if (this.premiumPill) {
      this.premiumPill.addEventListener("click", () =>
        this.showPremiumModal("premium_overview"),
      );
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

  setupPremiumLockButtons() {
    // All premium lock buttons
    const lockButtons = document.querySelectorAll(".premium-lock");

    lockButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const feature = button.closest(".premium-feature")?.dataset.feature;
        const action = button.dataset.action;

        this.handlePremiumClick(feature, action);
      });
    });
  }

  handlePremiumClick(feature, action) {
    // Track the click
    this.trackPremiumClick(feature, action);

    // Show premium modal with feature-specific content
    this.showPremiumModal(feature, action);
  }

  trackPremiumClick(feature, action) {
    if (!CONFIG.PREMIUM.FAKE_DOOR.TRACK_CLICKS) return;

    const clicks = ensureDataSafety(CONFIG.PREMIUM.STORAGE_KEYS.CLICKS, []);

    clicks.push({
      feature: feature,
      action: action,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100),
      version: CONFIG.VERSION,
      path: window.location.pathname,
    });

    // Keep only last 100 clicks
    if (clicks.length > 100) {
      clicks.splice(0, clicks.length - 100);
    }

    localStorage.setItem(
      CONFIG.PREMIUM.STORAGE_KEYS.CLICKS,
      JSON.stringify(clicks),
    );

    console.log(
      `Premium click tracked: ${feature}/${action} (Total: ${clicks.length})`,
    );
  }

  showPremiumModal(feature, action = "") {
    this.currentFeature = feature;

    // Update modal content based on feature
    this.updateFeatureHighlight(feature, action);

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

  updateFeatureHighlight(feature, action) {
    if (!this.featureHighlight) return;

    const featureData = this.getFeatureData(feature);

    let html = `
      <div class="feature-icon-large">
        <i class="${featureData.icon}"></i>
      </div>
      <h3>${featureData.title}</h3>
      <p class="feature-description">${featureData.description}</p>
    `;

    if (action === "add_goal" && window.enhancedGoalTracker) {
      const currentGoals = window.enhancedGoalTracker.data.goals?.length || 1; // Default to 1 for backward compatibility
      const maxGoals = CONFIG.PREMIUM.FREE_LIMITS.MAX_GOALS;

      html += `
        <div class="feature-limit">
          <i class="fas fa-chart-bar"></i>
          <span>Free: ${currentGoals}/${maxGoals} goals used</span>
        </div>
      `;
    }

    this.featureHighlight.innerHTML = html;
  }

  getFeatureData(feature) {
    const features = {
      multiple_goals: {
        title: "Multiple Goals",
        description:
          "Track multiple areas of your life simultaneously - fitness, learning, career, and personal growth.",
        icon: "fas fa-bullseye",
      },
      yearly_wrapped: {
        title: "Yearly Wrapped",
        description:
          "Get a beautiful summary of your year with insights, patterns, and shareable graphics.",
        icon: "fas fa-gift",
      },
      analytics: {
        title: "Advanced Analytics",
        description:
          "Deep insights into your consistency patterns, productivity trends, and goal achievement rates.",
        icon: "fas fa-chart-line",
      },
      export: {
        title: "Export & Share",
        description:
          "Download your data in multiple formats and create beautiful shareable progress cards.",
        icon: "fas fa-download",
      },
      cloud_sync: {
        title: "Cloud Sync",
        description:
          "Access your progress from any device. Your data stays in sync automatically.",
        icon: "fas fa-cloud",
      },
      premium_overview: {
        title: "Premium Features",
        description:
          "Unlock the full potential of Dayly with advanced tracking, insights, and multi-device support.",
        icon: "fas fa-crown",
      },
    };

    return features[feature] || features.premium_overview;
  }

  handleRemindMe() {
    // Store remind me preference
    const reminders = ensureDataSafety(
      CONFIG.PREMIUM.STORAGE_KEYS.REMINDERS,
      [],
    );

    reminders.push({
      timestamp: Date.now(),
      feature: this.currentFeature,
      reminded: true,
      appVersion: CONFIG.VERSION,
    });

    localStorage.setItem(
      CONFIG.PREMIUM.STORAGE_KEYS.REMINDERS,
      JSON.stringify(reminders),
    );

    // Show confirmation
    const remindButton = this.remindButton;
    if (remindButton) {
      const originalHTML = remindButton.innerHTML;
      remindButton.innerHTML =
        '<i class="fas fa-check"></i> We\'ll remind you!';
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

  updateGoalLimitDisplay() {
    // Update the premium lock button text to show current goal count
    const lockButton = document.querySelector('[data-action="add_goal"]');
    if (!lockButton) return;

    // Get current goal count
    let currentGoals = 1; // Default for backward compatibility

    if (window.enhancedGoalTracker && window.enhancedGoalTracker.data) {
      // Check if using new array format
      if (
        window.enhancedGoalTracker.data.goals &&
        Array.isArray(window.enhancedGoalTracker.data.goals)
      ) {
        currentGoals = window.enhancedGoalTracker.data.goals.length;
      } else if (window.enhancedGoalTracker.data.title) {
        // Using old single goal format
        currentGoals = 1;
      } else {
        currentGoals = 0;
      }
    }

    const maxGoals = CONFIG.PREMIUM.FREE_LIMITS.MAX_GOALS;

    const span = lockButton.querySelector("span");
    if (span) {
      span.textContent =
        currentGoals >= maxGoals
          ? `Free limit reached`
          : `Free: ${currentGoals}/${maxGoals} goals`;
    }
  }

  // Method to check if a premium feature should be blocked
  shouldBlockPremiumFeature(feature) {
    if (!CONFIG.PREMIUM.FAKE_DOOR.ENABLED) return false;

    // Check specific feature limits
    if (feature === "multiple_goals" && window.enhancedGoalTracker) {
      let currentGoals = 1;
      if (
        window.enhancedGoalTracker.data.goals &&
        Array.isArray(window.enhancedGoalTracker.data.goals)
      ) {
        currentGoals = window.enhancedGoalTracker.data.goals.length;
      } else if (window.enhancedGoalTracker.data.title) {
        currentGoals = 1;
      }

      return currentGoals >= CONFIG.PREMIUM.FREE_LIMITS.MAX_GOALS;
    }

    // All other premium features are blocked in free tier
    return true;
  }
}

// ============================================
// SOPHISTICATED BACKGROUND SYSTEM
// ============================================

class BackgroundSystem {
  constructor() {
    this.particles = [];
    this.isReducedMotion = CONFIG.PERFORMANCE.REDUCED_MOTION;
    this.init();
  }

  init() {
    if (this.isReducedMotion) return;

    this.createGridLayer();
    this.createTimePulse();
    this.createDataStreams();
    this.createParticles();
  }

  createGridLayer() {
    const gridLayer = document.createElement("div");
    gridLayer.className = "grid-layer";
    document.body.appendChild(gridLayer);
  }

  createTimePulse() {
    const timePulse = document.createElement("div");
    timePulse.className = "time-pulse";
    document.body.appendChild(timePulse);
  }

  createDataStreams() {
    const streamsContainer = document.createElement("div");
    streamsContainer.className = "data-streams";

    // Create 4 data streams (2 on each side)
    for (let i = 0; i < CONFIG.BACKGROUND.DATA_STREAMS; i++) {
      const stream = document.createElement("div");
      const isLeft = i < 2;
      const position = i % 2 === 0 ? 1 : 2;

      stream.className = `data-stream ${isLeft ? "left" : "right"}-${position}`;
      streamsContainer.appendChild(stream);
    }

    document.body.appendChild(streamsContainer);
  }

  createParticles() {
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "particles";
    document.body.appendChild(particlesContainer);

    // Calculate optimal particle count based on screen size
    const particleCount =
      window.innerWidth < 768
        ? Math.floor(CONFIG.BACKGROUND.PARTICLE_COUNT / 2)
        : CONFIG.BACKGROUND.PARTICLE_COUNT;

    for (let i = 0; i < particleCount; i++) {
      this.createParticle(particlesContainer, i);
    }
  }

  createParticle(container, index) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Calculate position based on golden ratio for natural distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angle = (index * 2 * Math.PI) / goldenRatio;
    const radius = Math.sqrt(index) * 2;

    const x = 50 + radius * Math.cos(angle);
    const drift = Math.sin(angle) * 2; // Natural drift pattern

    // Size based on distance from center (smaller at edges)
    const centerDistance = Math.abs(x - 50) / 50;
    const size = 1 + (1 - centerDistance) * 1.5;

    // Speed based on position (faster near center)
    const speed = 20 + (1 - centerDistance) * 15;

    // Delayed start for staggered appearance
    const delay = index * 0.1;

    particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}vw;
            animation-delay: ${delay}s;
            animation-duration: ${speed}s;
            --particle-drift: ${drift};
        `;

    // Store reference
    this.particles.push({
      element: particle,
      x,
      drift,
      speed,
      delay,
    });

    container.appendChild(particle);
  }

  updateForTheme(isDark) {
    // Update particle colors based on theme
    const particles = document.querySelectorAll(".particle");
    particles.forEach((particle) => {
      particle.style.background = isDark
        ? "rgba(76, 201, 240, 0.3)"
        : "rgba(67, 97, 238, 0.2)";
    });
  }

  updateForPerformance() {
    // Throttle animations if needed
    if (window.performance && window.performance.memory) {
      const usedJSHeapSize = window.performance.memory.usedJSHeapSize;
      const maxHeapSize = window.performance.memory.jsHeapSizeLimit;

      if (usedJSHeapSize > maxHeapSize * 0.7) {
        this.throttleAnimations();
      }
    }
  }

  throttleAnimations() {
    // Reduce animation intensity if memory is high
    const animations = document.querySelectorAll(".particle, .data-stream");
    animations.forEach((anim) => {
      const currentDuration = parseFloat(
        getComputedStyle(anim).animationDuration,
      );
      anim.style.animationDuration = `${currentDuration * 1.5}s`;
    });
  }
}

// ============================================
// THEME MANAGEMENT
// ============================================

class ThemeManager {
  constructor(backgroundSystem) {
    this.currentTheme = this.getPreferredTheme();
    this.backgroundSystem = backgroundSystem;
    this.init();
  }

  getPreferredTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME.STORAGE_KEY);
    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? CONFIG.THEME.DARK
      : CONFIG.THEME.LIGHT;
  }

  init() {
    this.setTheme(this.currentTheme);
    this.setupEventListeners();
    this.watchSystemTheme();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(CONFIG.THEME.STORAGE_KEY, theme);

    const isDark = theme === CONFIG.THEME.DARK;
    this.updateUI(isDark);

    // Update background system
    if (this.backgroundSystem) {
      this.backgroundSystem.updateForTheme(isDark);
    }
  }

  toggleTheme() {
    const newTheme =
      this.currentTheme === CONFIG.THEME.DARK
        ? CONFIG.THEME.LIGHT
        : CONFIG.THEME.DARK;
    this.setTheme(newTheme);
    this.triggerPullChainAnimation();
    return newTheme;
  }

  updateUI(isDark) {
    if (lightBulb) {
      lightBulb.classList.toggle("on", !isDark);
    }

    if (themeToggle) {
      themeToggle.checked = !isDark;
    }
  }

  triggerPullChainAnimation() {
    if (pullChain) {
      pullChain.classList.add("pulling");
      setTimeout(() => {
        pullChain.classList.remove("pulling");
      }, 500);
    }
  }

  setupEventListeners() {
    if (lightBulb) {
      lightBulb.addEventListener("click", () => this.toggleTheme());
    }

    if (pullChain) {
      pullChain.addEventListener("click", () => this.toggleTheme());
    }

    if (themeToggle) {
      themeToggle.addEventListener("change", () => this.toggleTheme());
    }
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (e) => {
      if (!localStorage.getItem(CONFIG.THEME.STORAGE_KEY)) {
        this.setTheme(e.matches ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT);
      }
    });
  }
}

// ============================================
// ENHANCED DAILY STREAK SYSTEM
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
      checkIns: {}, // YYYY-MM-DD: {type: 'showed_up' | 'worked_toward_goal', timestamp: number}
      streakHistory: [], // Array of streak objects {start: date, end: date, length: number}
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

  checkForMissedDays() {
    const today = this.formatDate(new Date());
    const yesterday = this.formatDate(new Date(Date.now() - 86400000));

    // If user checked in yesterday but not today, and it's past their usual time
    if (
      this.data.lastCheckIn === yesterday &&
      this.data.lastCheckIn !== today
    ) {
      // Check if it's been more than grace period
      const lastCheckInTime = this.getCheckInTimestamp(yesterday);
      if (
        lastCheckInTime &&
        Date.now() - lastCheckInTime >
          CONFIG.STREAK.GRACE_PERIOD_HOURS * 60 * 60 * 1000
      ) {
        this.resetStreak();
        this.showMessage("💔 Streak reset - missed a day!", "error");
      }
    }
  }

  getCheckInTimestamp(dateStr) {
    if (this.data.checkIns[dateStr] && this.data.checkIns[dateStr].timestamp) {
      return this.data.checkIns[dateStr].timestamp;
    }
    return null;
  }

  setupCheckInButtons() {
    // Main check-in button
    const mainButton = document.getElementById("checkInButton");
    if (mainButton) {
      mainButton.addEventListener("click", () => this.checkIn("showed_up"));
    }

    // Goal check-in button
    const goalButton = document.getElementById("goalCheckInButton");
    if (goalButton) {
      goalButton.addEventListener("click", () =>
        this.checkIn("worked_toward_goal"),
      );
    }
  }

  showGoalCheckInButton() {
    const goalButton = document.getElementById("goalCheckInButton");
    if (goalButton) {
      // Show goal check-in button if a goal exists
      if (window.enhancedGoalTracker) {
        const currentGoal = window.enhancedGoalTracker.getCurrentGoal();
        if (currentGoal && currentGoal.title) {
          goalButton.style.display = "flex";
        }
      }
    }
  }

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

  saveStreakToHistory() {
    if (this.data.streak > 0 && this.data.lastCheckIn) {
      // Calculate start date of the streak
      const endDate = new Date(this.data.lastCheckIn + "T00:00:00");
      const startDate = new Date(
        endDate.getTime() - (this.data.streak - 1) * 86400000,
      );

      this.data.streakHistory.push({
        start: this.formatDate(startDate),
        end: this.data.lastCheckIn,
        length: this.data.streak,
      });

      // Keep only last 10 streaks in history
      if (this.data.streakHistory.length > 10) {
        this.data.streakHistory.shift();
      }
    }
  }

  updateStreakGrid() {
    const grid = document.querySelector(".streak-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const today = new Date();
    const todayStr = this.formatDate(today);

    for (let week = 0; week < 4; week++) {
      const weekDiv = document.createElement("div");
      weekDiv.className = "week";
      weekDiv.id = `week${week + 1}`;

      for (let day = 6; day >= 0; day--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        const dateStr = this.formatDate(date);

        const dayBox = document.createElement("div");
        dayBox.className = "day-box";
        dayBox.title =
          date.toLocaleDateString() +
          (this.data.checkIns[dateStr]
            ? `\nChecked in (${this.data.checkIns[dateStr].type})`
            : "");

        // Determine level based on streak position
        let level = 0;
        if (this.data.checkIns[dateStr]) {
          // Current streak days get higher levels
          const checkInDate = new Date(dateStr + "T00:00:00");
          const daysSince = Math.floor((today - checkInDate) / 86400000);

          if (dateStr === todayStr) {
            level = 4; // Today
          } else if (daysSince <= this.data.streak) {
            level = Math.min(3, Math.max(1, 4 - Math.floor(daysSince / 7)));
          } else {
            level = 1; // Past check-in
          }

          dayBox.classList.add(`level-${level}`);

          // Add icon for today's check-in
          if (dateStr === todayStr) {
            const icon = document.createElement("i");
            icon.className =
              this.data.checkIns[dateStr].type === "worked_toward_goal"
                ? "fas fa-bullseye"
                : "fas fa-check";
            dayBox.innerHTML = "";
            dayBox.appendChild(icon);
          }
        }

        // Highlight current streak
        const streakStart = this.getStreakStartDate();
        if (
          streakStart &&
          dateStr >= streakStart &&
          dateStr <= todayStr &&
          this.data.streak > 0
        ) {
          dayBox.classList.add("current-streak-day");
        }

        weekDiv.appendChild(dayBox);
      }
      grid.appendChild(weekDiv);
    }
  }

  getStreakStartDate() {
    if (!this.data.lastCheckIn || this.data.streak === 0) return null;
    const endDate = new Date(this.data.lastCheckIn + "T00:00:00");
    const startDate = new Date(
      endDate.getTime() - (this.data.streak - 1) * 86400000,
    );
    return this.formatDate(startDate);
  }

  resetStreak() {
    if (this.data.streak > 0) {
      this.saveStreakToHistory();
    }
    this.data.streak = 0;
    this.saveData();
    this.updateDisplay();
  }

  animateCheckIn(type) {
    const button = document.getElementById("checkInButton");
    if (button) {
      const originalHTML = button.innerHTML;
      button.innerHTML = `<i class="fas fa-${type === "worked_toward_goal" ? "bullseye" : "check-circle"}"></i> ${type === "worked_toward_goal" ? "Goal Progress Recorded!" : "Checked In!"}`;
      button.style.background =
        type === "worked_toward_goal"
          ? "linear-gradient(135deg, #4361ee, #3a0ca3)"
          : "linear-gradient(135deg, #40c463, #30a14e)";
      button.disabled = true;

      // Disable for 24 hours (in production) or 30 seconds (for testing)
      const disableTime = CONFIG.STREAK.TEST_MODE ? 30000 : 24 * 60 * 60 * 1000;

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = "linear-gradient(135deg, #ff6b6b, #ffa726)";
        button.disabled = false;
      }, disableTime);
    }
  }

  updateDisplay() {
    // Update streak count
    const streakCountEl = document.getElementById("streakCount");
    if (streakCountEl) {
      streakCountEl.textContent = this.data.streak;
    }

    // Update message if needed
    if (this.data.streak === 0) {
      this.showWelcomeMessage();
    }
  }

  showWelcomeMessage() {
    const msgEl = document.getElementById("streakMessage");
    if (msgEl) {
      msgEl.textContent =
        "Start your streak today! Come back tomorrow to continue.";
      msgEl.className = "streak-message info";
      msgEl.classList.add("show");

      setTimeout(() => {
        msgEl.classList.remove("show");
      }, 5000);
    }
  }

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
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }
}

// ============================================
// ENHANCED GOAL TRACKER (UPDATED FOR PREMIUM)
// ============================================

class EnhancedGoalTracker {
  constructor() {
    this.storageKey = "dayly_enhanced_goal";
    this.data = this.loadData();
    this.lastMotivationalMessage = 0;
    this.MOTIVATION_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    this.init();
    console.log("Enhanced Goal Tracker initialized");
  }

  loadData() {
    const defaultData = {
      version: "1.0",
      goals: [], // Array for multiple goals
      activeGoalIndex: 0,
      // Backward compatibility fields
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

      // Migration: Convert single goal to array format (for backward compatibility)
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

    // Update premium goal limit display
    if (window.premiumSystem) {
      window.premiumSystem.updateGoalLimitDisplay();
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
      return this.data.goals[0]; // Fallback to first goal
    }

    // Fallback to old single goal structure for backward compatibility
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
    // Check if we can add a new goal (for premium)
    if (
      window.premiumSystem &&
      window.premiumSystem.shouldBlockPremiumFeature("multiple_goals")
    ) {
      // Show premium modal
      window.premiumSystem.handlePremiumClick("multiple_goals", "add_goal");
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

    // Update premium goal limit display
    if (window.premiumSystem) {
      window.premiumSystem.updateGoalLimitDisplay();
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

    // Visual feedback
    this.animateProgressUpdate();

    // Show motivational message if appropriate
    this.checkForWeeklyMotivation(true);
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
// FEEDBACK SYSTEM
// ============================================

class FeedbackSystem {
  constructor() {
    this.modal = document.getElementById("feedbackModal");
    this.form = document.getElementById("feedbackForm");
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormspreeIntegration();
  }

  setupEventListeners() {
    // Open modal
    const openBtn = document.getElementById("openFeedbackModal");
    if (openBtn) {
      openBtn.addEventListener("click", () => this.openModal());
    }

    // Footer feedback button
    const footerBtn = document.getElementById("footerFeedbackBtn");
    if (footerBtn) {
      footerBtn.addEventListener("click", () => this.openModal());
    }

    // Close modal
    const closeBtn = document.getElementById("closeFeedbackModal");
    const cancelBtn = document.getElementById("cancelFeedback");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeModal());
    }

    // Close on outside click
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
        this.modal.classList.contains("active")
      ) {
        this.closeModal();
      }
    });
  }

  setupFormspreeIntegration() {
    if (!this.form) return;

    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Add user data if checkbox is checked
      const includeData = this.form.querySelector(
        '[name="include_anonymous_data"]',
      ).checked;
      if (includeData) {
        this.addUserDataToForm();
      }

      // Show loading state
      const submitBtn = this.form.querySelector(".submit-btn");
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "";
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      try {
        // Send to Formspree
        const formData = new FormData(this.form);
        const response = await fetch(this.form.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          this.showSuccessMessage();
        } else {
          throw new Error("Form submission failed");
        }
      } catch (error) {
        console.error("Feedback submission error:", error);
        this.showErrorMessage();
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

  addUserDataToForm() {
    const userData = {
      streak: window.enhancedStreakSystem?.data?.streak || 0,
      longestStreak: window.enhancedStreakSystem?.data?.longestStreak || 0,
      totalCheckIns: window.enhancedStreakSystem?.data?.totalCheckIns || 0,
      hasGoal: false,
      goalProgress: 0,
      goalTotal: 0,
      goalCompleted: false,
      premiumClicks: 0,
      currentTheme:
        document.documentElement.getAttribute("data-theme") || "dark",
      userAgent: navigator.userAgent.substring(0, 100), // Truncated
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
      appVersion: CONFIG.VERSION,
    };

    // Add goal data
    if (window.enhancedGoalTracker) {
      const currentGoal = window.enhancedGoalTracker.getCurrentGoal();
      userData.hasGoal = !!(currentGoal && currentGoal.title);
      userData.goalProgress = currentGoal?.progressDays || 0;
      userData.goalTotal = currentGoal?.totalDays || 0;
      userData.goalCompleted = currentGoal?.completed || false;
    }

    // Add premium click data
    const premiumClicks = ensureDataSafety(
      CONFIG.PREMIUM.STORAGE_KEYS.CLICKS,
      [],
    );
    userData.premiumClicks = premiumClicks.length;

    const userDataField = document.getElementById("userData");
    if (userDataField) {
      userDataField.value = JSON.stringify(userData);
    }
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scrolling

      // Auto-fill email if previously entered
      const emailField = document.getElementById("feedbackEmail");
      const storedEmail = localStorage.getItem("dayly_feedback_email");
      if (emailField && storedEmail) {
        emailField.value = storedEmail;
      }

      // Focus on first input
      setTimeout(() => {
        const firstInput = this.modal.querySelector("input, select, textarea");
        if (firstInput) firstInput.focus();
      }, 300);
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("active");
      document.body.style.overflow = ""; // Re-enable scrolling

      // Reset form after delay
      setTimeout(() => {
        this.resetForm();
      }, 300);
    }
  }

  resetForm() {
    if (this.form) {
      this.form.reset();

      // Hide success/error messages
      const successMsg = this.modal.querySelector(".feedback-success");
      const errorMsg = this.modal.querySelector(".feedback-error");
      if (successMsg) successMsg.classList.remove("active");
      if (errorMsg) errorMsg.classList.remove("active");

      // Show form
      this.form.style.display = "block";
    }
  }

  showSuccessMessage() {
    // Save email for next time
    const emailField = document.getElementById("feedbackEmail");
    if (emailField && emailField.value) {
      localStorage.setItem("dayly_feedback_email", emailField.value);
    }

    // Create or show success message
    let successDiv = this.modal.querySelector(".feedback-success");
    if (!successDiv) {
      successDiv = document.createElement("div");
      successDiv.className = "feedback-success";
      successDiv.innerHTML = `
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>Thank You!</h3>
        <p>Your feedback has been received. We truly appreciate you helping us improve DAYLY.</p>
        <p class="form-note" style="margin-top: 20px;">
          <i class="fas fa-heart"></i>
          We'll review your feedback carefully.
        </p>
        <button class="submit-btn" style="margin-top: 20px;">
          <i class="fas fa-times"></i>
          Close
        </button>
      `;

      // Add close event to the new button
      successDiv
        .querySelector(".submit-btn")
        .addEventListener("click", () => this.closeModal());

      this.modal
        .querySelector(".feedback-modal-content")
        .appendChild(successDiv);
    }

    successDiv.classList.add("active");
    this.form.style.display = "none";
  }

  showErrorMessage() {
    // Create or show error message
    let errorDiv = this.modal.querySelector(".feedback-error");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "feedback-error";
      errorDiv.innerHTML = `
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Something Went Wrong</h3>
        <p>We couldn't send your feedback. Please try again or contact us directly.</p>
        <div class="form-buttons" style="margin-top: 20px;">
          <button class="cancel-btn" id="tryAgainBtn">
            <i class="fas fa-redo"></i>
            Try Again
          </button>
          <button class="submit-btn" id="closeErrorBtn">
            <i class="fas fa-times"></i>
            Close
          </button>
        </div>
      `;

      // Add event listeners to the new buttons
      errorDiv
        .querySelector("#tryAgainBtn")
        .addEventListener("click", () => this.resetForm());
      errorDiv
        .querySelector("#closeErrorBtn")
        .addEventListener("click", () => this.closeModal());

      this.modal.querySelector(".feedback-modal-content").appendChild(errorDiv);
    }

    errorDiv.classList.add("active");
    this.form.style.display = "none";
  }
}

// ============================================
// CORE APP FUNCTIONALITY
// ============================================

// Utility Functions
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function calculateProgress(currentDate) {
  const year = currentDate.getFullYear();
  const dayOfYearValue = getDayOfYear(currentDate);
  const totalDaysInYear = getDaysInYear(year);
  const progress = (dayOfYearValue / totalDaysInYear) * 100;

  return {
    year,
    dayOfYear: dayOfYearValue,
    totalDays: totalDaysInYear,
    progress: progress,
    daysRemaining: totalDaysInYear - dayOfYearValue,
  };
}

function getCurrentSeason(date, hemisphere = "northern") {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const seasons = CONFIG.SEASONS[hemisphere];

  for (const season of Object.values(seasons)) {
    const startDate = new Date(
      date.getFullYear(),
      season.startMonth - 1,
      season.startDay,
    );
    let endDate = new Date(
      date.getFullYear(),
      season.endMonth - 1,
      season.endDay,
    );

    if (season.startMonth > season.endMonth) {
      if (month >= season.startMonth || month <= season.endMonth) {
        if (month === season.startMonth && day < season.startDay) {
          continue;
        }
        if (month === season.endMonth && day > season.endDay) {
          continue;
        }
        return season;
      }
    } else {
      if (month > season.startMonth && month < season.endMonth) {
        return season;
      }
      if (month === season.startMonth && day >= season.startDay) {
        return season;
      }
      if (month === season.endMonth && day <= season.endDay) {
        return season;
      }
    }
  }

  return Object.values(seasons)[0];
}

// Performance Optimized Update Functions
let lastProgressUpdate = 0;
const PROGRESS_UPDATE_THROTTLE = 5000;

function updateDateTime() {
  const now = new Date();
  const timestamp = now.getTime();

  dateDisplay.textContent = formatDate(now);
  timeDisplay.textContent = formatTime(now);

  const progressData = calculateProgress(now);

  yearLabel.textContent = progressData.year;

  const formattedProgress = progressData.progress.toFixed(2);
  percentageDisplay.textContent = `${formattedProgress}%`;
  percentText.textContent = `${formattedProgress}%`;

  progressBar.style.width = `${progressData.progress}%`;

  if (timestamp - lastProgressUpdate > PROGRESS_UPDATE_THROTTLE) {
    dayOfYear.textContent = progressData.dayOfYear;
    daysRemaining.textContent = progressData.daysRemaining;
    totalDays.textContent = progressData.totalDays;
    lastProgressUpdate = timestamp;
  }

  updateSeason(now);
  currentYear.textContent = progressData.year;
}

function updateYearProgress() {
  // This function is called periodically to update the year progress
  updateDateTime();
}

function updateSeason(date) {
  const hemisphere = seasonDropdown.value;
  const season = getCurrentSeason(date, hemisphere);

  seasonName.textContent = season.name;
  seasonName.style.color = season.color;

  const startMonthName = getMonthName(season.startMonth - 1);
  const endMonthName = getMonthName(season.endMonth - 1);
  seasonDates.textContent = `${startMonthName} ${season.startDay} - ${endMonthName} ${season.endDay}`;

  const seasonIcon = document.querySelector(".season-icon i");
  if (seasonIcon) {
    seasonIcon.className = season.icon;
    seasonIcon.style.color = season.color;
  }
}

function getMonthName(monthIndex) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthIndex];
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

  // Initialize premium system
  window.premiumSystem = new PremiumSystem();

  // Set version info
  versionInfo.textContent = `v${CONFIG.VERSION}`;

  // Set initial progress text with percentage
  const now = new Date();
  const initialProgress = calculateProgress(now);

  progressText.textContent = `${initialProgress.year} is ${initialProgress.progress.toFixed(2)}% complete`;

  // Set up updates
  updateInterval = setInterval(updateDateTime, CONFIG.UPDATE_INTERVAL);

  // Set up year progress updates (less frequent)
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

function animateToggleSwitch() {
  setTimeout(() => {
    if (toggleSwitch) {
      toggleSwitch.classList.add("visible");
    }
  }, 1000);
}

function handleResize() {
  // Throttle resize handling
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    if (backgroundSystem) {
      backgroundSystem.updateForPerformance();
    }
  }, 250);
}

function setupPerformanceMonitoring() {
  // Only enable in development/test environments
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  if (!isDevelopment) return;

  let frameCount = 0;
  let lastTime = performance.now();

  function checkFPS(currentTime) {
    frameCount++;

    if (currentTime > lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

      if (fps < 30) {
        console.warn(`Low FPS: ${fps}. Consider reducing animations.`);
        if (backgroundSystem) {
          backgroundSystem.throttleAnimations();
        }
      }

      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(checkFPS);
  }

  requestAnimationFrame(checkFPS);
}

// ============================================
// SERVICE WORKER & CLEANUP
// ============================================

function registerServiceWorker() {
  if (
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost")
  ) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("ServiceWorker registered:", registration);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  }
}

function cleanup() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  window.removeEventListener("resize", handleResize);
}

// ============================================
// START THE APP
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  enhancedInit();
  registerServiceWorker();

  window.addEventListener("beforeunload", cleanup);
});

// Add confetti animation to CSS dynamically
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
@keyframes confettiFall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(var(--distance) * cos(var(--angle)) * 1px),
      calc(var(--distance) * sin(var(--angle)) * 1px)
    ) rotate(360deg);
    opacity: 0;
  }
}
</style>
`,
);
