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
  VERSION: "1.3.0",
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
};

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
      if (window.enhancedGoalTracker && window.enhancedGoalTracker.data.title) {
        goalButton.style.display = "flex";
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
// ENHANCED GOAL TRACKER
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
      title: "",
      description: "",
      startDate: null,
      targetDate: null,
      progressDays: 0,
      totalDays: 90,
      checkIns: {}, // YYYY-MM-DD: {notes: string, timestamp: number}
      completed: false,
      completedDate: null,
      milestones: [], // Array of milestone achievements
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : defaultData;
    } catch (e) {
      console.error("Error loading goal data:", e);
      return defaultData;
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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
    const hasGoal = this.data.title && this.data.startDate;

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

  setupEventListeners() {
    // Edit goal button
    const editButton = document.getElementById("editGoalButton");
    if (editButton) {
      editButton.addEventListener("click", () => {
        this.showGoalSetup();
      });
    }

    // Save goal button
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
      if (this.data.title) {
        const goalInput = document.getElementById("goalInput");
        const goalDescription = document.getElementById("goalDescription");
        const goalDuration = document.getElementById("goalDuration");

        if (goalInput) goalInput.value = this.data.title;
        if (goalDescription)
          goalDescription.value = this.data.description || "";
        if (goalDuration) goalDuration.value = this.data.totalDays.toString();
      }
    }
  }

  saveGoal() {
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

    this.data = {
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
    };

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

  recordProgress() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Check if already recorded today
    if (this.data.checkIns[todayStr]) {
      this.showMessage("Already recorded progress today! Great job!", "info");
      return;
    }

    // Record progress
    this.data.checkIns[todayStr] = {
      notes: "",
      timestamp: Date.now(),
    };
    this.data.progressDays++;

    // Check milestones
    this.checkMilestones();

    // Check if goal completed
    if (this.data.progressDays >= this.data.totalDays && !this.data.completed) {
      this.completeGoal();
      return;
    }

    this.saveData();
    this.updateDisplay();

    // Visual feedback
    this.animateProgressUpdate();

    // Show motivational message if appropriate
    this.checkForWeeklyMotivation(true);
  }

  checkMilestones() {
    this.data.milestones.forEach((milestone) => {
      if (!milestone.achieved && this.data.progressDays >= milestone.day) {
        milestone.achieved = true;
        milestone.achievedDate = new Date().toISOString();
        this.showMessage(`🏆 ${milestone.message}`, "milestone");
      }
    });
  }

  completeGoal() {
    this.data.completed = true;
    this.data.completedDate = new Date().toISOString();
    this.saveData();
    this.updateDisplay();

    this.showMessage(
      `🎉 CONGRATULATIONS! You completed "${this.data.title}" in ${this.data.progressDays} days!`,
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
    const now = Date.now();
    const shouldShow =
      forceCheck ||
      now - this.lastMotivationalMessage > this.MOTIVATION_COOLDOWN;

    if (shouldShow && this.data.progressDays > 0) {
      const weekNumber = Math.floor(this.data.progressDays / 7);
      if (weekNumber > 0) {
        const messages = [
          `🔥 Week ${weekNumber} in the books! ${this.getPaceMessage()}`,
          `🎯 ${this.data.progressDays} days of consistent effort! ${this.getCompletionEstimate()}`,
          `💪 You're ${((this.data.progressDays / this.data.totalDays) * 100).toFixed(1)}% to your goal!`,
          `🚀 At this pace, you'll reach your goal by ${this.getProjectedDate()}.`,
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        this.showMessage(randomMsg, "motivation");
        this.lastMotivationalMessage = now;
      }
    }
  }

  getPaceMessage() {
    const daysCompleted = this.data.progressDays;
    const expectedDays = this.getExpectedDays();

    if (daysCompleted > expectedDays) {
      return "You're ahead of schedule!";
    } else if (daysCompleted < expectedDays) {
      return "Keep going, you're making progress!";
    } else {
      return "Right on track!";
    }
  }

  getExpectedDays() {
    if (!this.data.startDate) return 0;
    const start = new Date(this.data.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCompletionEstimate() {
    if (this.data.completed) return "Goal completed!";

    const remaining = this.data.totalDays - this.data.progressDays;
    const dailyRate =
      this.data.progressDays / Math.max(1, this.getExpectedDays());

    if (dailyRate > 0) {
      const daysToComplete = Math.ceil(remaining / dailyRate);
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + daysToComplete);
      return `Estimated completion: ${completionDate.toLocaleDateString()}`;
    }

    return "Start tracking to see your completion date!";
  }

  getProjectedDate() {
    if (!this.data.startDate) return "soon";

    const start = new Date(this.data.startDate);
    const projected = new Date(start);
    projected.setDate(projected.getDate() + this.data.totalDays);

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
    if (!this.data.title) return;

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
      elements.title.textContent = this.data.title;
      if (this.data.completed) {
        elements.title.innerHTML += ' <span style="color: #00ff88;">✓</span>';
      }
    }

    if (elements.progressDays)
      elements.progressDays.textContent = this.data.progressDays;
    if (elements.totalDays)
      elements.totalDays.textContent = this.data.totalDays;

    const progressPercent =
      (this.data.progressDays / this.data.totalDays) * 100;
    if (elements.progressPercent) {
      elements.progressPercent.textContent = `${Math.min(progressPercent, 100).toFixed(1)}%`;
    }

    if (elements.startDate && this.data.startDate) {
      const start = new Date(this.data.startDate);
      elements.startDate.textContent = start.toLocaleDateString();
    }

    const remaining = Math.max(0, this.data.totalDays - this.data.progressDays);
    if (elements.daysRemaining) elements.daysRemaining.textContent = remaining;

    if (elements.completionDate && this.data.targetDate) {
      const target = new Date(this.data.targetDate);
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

  // Initialize background system
  backgroundSystem = new BackgroundSystem();

  // Initialize theme manager with background system
  themeManager = new ThemeManager(backgroundSystem);

  // Initialize enhanced systems
  window.enhancedStreakSystem = new EnhancedDailyStreak();
  window.enhancedGoalTracker = new EnhancedGoalTracker();

  // Set version info
  versionInfo.textContent = `v${CONFIG.VERSION}`;

  // Set initial progress text with percentage
  const now = new Date();
  const initialProgress = calculateProgress(now);

  progressText.textContent = `${initialProgress.year} is ${initialProgress.progress.toFixed(2)}% complete`;

  // Set up updates
  updateInterval = setInterval(updateDateTime, CONFIG.UPDATE_INTERVAL);

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
