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
  VERSION: "1.1.0",
  UPDATE_INTERVAL: 1000,
  PERFORMANCE: {
    THROTTLE_ANIMATIONS: true,
    ANIMATION_DURATION: 800,
  },
  THEME: {
    DARK: "dark",
    LIGHT: "light",
    STORAGE_KEY: "yearProgressTheme",
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
};

// Theme Management
class ThemeManager {
  constructor() {
    this.currentTheme = this.getPreferredTheme();
    this.init();
  }

  getPreferredTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME.STORAGE_KEY);
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? CONFIG.THEME.DARK
      : CONFIG.THEME.LIGHT;
  }

  init() {
    // Apply initial theme
    this.setTheme(this.currentTheme);

    // Set up event listeners
    this.setupEventListeners();

    // Watch for system theme changes
    this.watchSystemTheme();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(CONFIG.THEME.STORAGE_KEY, theme);

    // Update UI elements
    this.updateUI(theme === CONFIG.THEME.DARK);
  }

  toggleTheme() {
    const newTheme =
      this.currentTheme === CONFIG.THEME.DARK
        ? CONFIG.THEME.LIGHT
        : CONFIG.THEME.DARK;
    this.setTheme(newTheme);

    // Trigger pull chain animation
    this.triggerPullChainAnimation();

    return newTheme;
  }

  updateUI(isDark) {
    // Update light bulb
    if (lightBulb) {
      if (isDark) {
        lightBulb.classList.remove("on");
      } else {
        lightBulb.classList.add("on");
      }
    }

    // Update toggle switch
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
    // Light bulb click
    if (lightBulb) {
      lightBulb.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Pull chain click
    if (pullChain) {
      pullChain.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Toggle switch change
    if (themeToggle) {
      themeToggle.addEventListener("change", () => {
        this.toggleTheme();
      });
    }
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem(CONFIG.THEME.STORAGE_KEY)) {
        this.setTheme(e.matches ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT);
      }
    });
  }
}

// Initialize Theme Manager
let themeManager;

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
    seasonIcon.classList.remove(
      "fa-sun",
      "fa-snowflake",
      "fa-seedling",
      "fa-leaf",
    );
    const iconClasses = season.icon.split(" ");
    iconClasses.forEach((cls) => {
      if (cls) seasonIcon.classList.add(cls);
    });
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

// Create Particle Background
function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "particles";
  document.body.prepend(particlesContainer);

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random properties
    const size = Math.random() * 2 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 10 + 20;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}vw`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.opacity = Math.random() * 0.5 + 0.1;

    // Color based on theme
    const isDark = themeManager?.currentTheme === CONFIG.THEME.DARK;
    particle.style.background = isDark
      ? "rgba(76, 201, 240, 0.3)"
      : "rgba(67, 97, 238, 0.2)";

    particlesContainer.appendChild(particle);
  }
}

// Toggle Switch Animation
function animateToggleSwitch() {
  setTimeout(() => {
    toggleSwitch.classList.add("visible");
  }, 1000);
}

// Initialize App
function init() {
  console.log(`Year Progress Tracker v${CONFIG.VERSION} initializing...`);

  // Initialize theme manager
  themeManager = new ThemeManager();

  // Set version info
  versionInfo.textContent = `v${CONFIG.VERSION}`;

  // Create particle background
  createParticles();

  // Set initial progress text
  const now = new Date();
  const initialProgress = calculateProgress(now);

  const staticText = document.createElement("span");
  staticText.textContent = `${initialProgress.year} is `;

  progressText.textContent = "";
  progressText.appendChild(staticText);
  progressText.appendChild(document.createTextNode(" complete"));

  // Set up updates
  const updateInterval = setInterval(updateDateTime, CONFIG.UPDATE_INTERVAL);

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

  console.log("App initialized successfully");

  return () => clearInterval(updateInterval);
}

// Service Worker Registration
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

// Start the app
document.addEventListener("DOMContentLoaded", () => {
  const cleanup = init();
  registerServiceWorker();

  window.addEventListener("beforeunload", cleanup);
});
