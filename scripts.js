// DOM Elements - direct references
const dateDisplay = document.getElementById("dateDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const percentText = document.getElementById("percentText");
const percentTextInline = document.getElementById("percentTextInline");
const yearText = document.getElementById("yearText");
const daysPassed = document.getElementById("daysPassed");
const daysRemaining = document.getElementById("daysRemaining");
const totalDays = document.getElementById("totalDays");
const currentYear = document.getElementById("currentYear");
const themeToggle = document.getElementById("themeToggle");

// New feature elements
const weekDisplay = document.getElementById("weekDisplay");
const monthPercentText = document.getElementById("monthPercentText");
const monthProgressBar = document.getElementById("monthProgressBar");
const monthNameText = document.getElementById("monthNameText");
const monthPercentInline = document.getElementById("monthPercentInline");
const greetingText = document.getElementById("greetingText");
const eventCountdown = document.getElementById("eventCountdown");
const streakCount = document.getElementById("streakCount");

// Goal Tracker Elements
const goalInput = document.getElementById("goalInput");
const goalTimeline = document.getElementById("goalTimeline"); // Changed from goalDays
const startGoalBtn = document.getElementById("startGoalBtn");
const editGoalBtn = document.getElementById("editGoalBtn");
const goalProgressPercent = document.getElementById("goalProgressPercent");
const goalProgressBar = document.getElementById("goalProgressBar");
const goalProgressText = document.getElementById("goalProgressText");
const goalStreakCount = document.getElementById("goalStreakCount");
const completionBadge = document.getElementById("completionBadge");

// Theme Management
let isDarkMode = true;

// Goal state
let mainGoal = null;
let goalStreak = 0;
let isEditing = false;
let generalStreak = localStorage.getItem("streak")
  ? parseInt(localStorage.getItem("streak"))
  : 0;

// Theme functions
function initTheme() {
  const savedTheme = localStorage.getItem("yearProgressTheme");
  if (savedTheme === "light") {
    setLightMode();
  } else {
    setDarkMode();
  }
}

function setLightMode() {
  document.body.classList.remove("dark-mode");
  document.body.classList.add("light-mode");
  isDarkMode = false;
  localStorage.setItem("yearProgressTheme", "light");
}

function setDarkMode() {
  document.body.classList.remove("light-mode");
  document.body.classList.add("dark-mode");
  isDarkMode = true;
  localStorage.setItem("yearProgressTheme", "dark");
}

function toggleTheme() {
  if (isDarkMode) {
    setLightMode();
  } else {
    setDarkMode();
  }
}

// Date calculation functions
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getTotalDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getWeekNumber(date) {
  const dayOfYear = getDayOfYear(date);
  return Math.ceil(dayOfYear / 7);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning 🌅";
  if (hour < 18) return "Good Afternoon ☀️";
  return "Good Evening 🌙";
}

// Main update function
function updateDateTime() {
  const now = new Date();
  const year = now.getFullYear();

  // Get day of year
  const dayOfYear = getDayOfYear(now);
  const totalDaysInYear = getTotalDaysInYear(year);

  // Calculate progress
  const progress = (dayOfYear / totalDaysInYear) * 100;
  const progressFixed = progress.toFixed(2);

  // Update date and time
  dateDisplay.textContent = formatDate(now);
  timeDisplay.textContent = formatTime(now);

  // Update week number
  if (weekDisplay) weekDisplay.textContent = getWeekNumber(now);

  // Update year progress bar
  if (progressBar) progressBar.style.width = `${progress}%`;

  // Update year percentage displays
  if (percentText) percentText.textContent = `${progressFixed}%`;
  if (percentTextInline) percentTextInline.textContent = `${progressFixed}%`;

  // Update year text
  if (yearText) yearText.textContent = year;

  // Update stats
  if (daysPassed) daysPassed.textContent = dayOfYear;
  if (daysRemaining) daysRemaining.textContent = totalDaysInYear - dayOfYear;
  if (totalDays) totalDays.textContent = totalDaysInYear;

  // Update footer year
  if (currentYear) currentYear.textContent = year;

  // Update month progress
  updateMonthProgress(now);

  // Update greeting
  if (greetingText) greetingText.textContent = getGreeting();

  // Update event countdown
  updateEventCountdown();

  // Update general streak
  updateStreak();

  // Check for new day in goal tracking
  checkNewDay();
}

// Month progress calculation
function updateMonthProgress(now) {
  if (
    !monthProgressBar ||
    !monthPercentText ||
    !monthNameText ||
    !monthPercentInline
  )
    return;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = now.getMonth();
  const monthName = monthNames[currentMonth];

  // Get first and last day of current month
  const firstDay = new Date(now.getFullYear(), currentMonth, 1);
  const lastDay = new Date(now.getFullYear(), currentMonth + 1, 0);

  // Calculate days in month and current day
  const daysInMonth = lastDay.getDate();
  const currentDay = now.getDate();

  // Calculate month progress
  const monthProgress = (currentDay / daysInMonth) * 100;
  const monthProgressFixed = monthProgress.toFixed(2);

  // Update month progress
  monthProgressBar.style.width = `${monthProgress}%`;
  monthPercentText.textContent = `${monthProgressFixed}%`;
  monthPercentInline.textContent = `${monthProgressFixed}%`;
  monthNameText.textContent = `${monthName} is`;
}

function updateEventCountdown() {
  if (!eventCountdown) return;

  const nextEventDate = new Date("2026-03-22");
  const today = new Date();

  // Reset times to compare only dates
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const eventDate = new Date(
    nextEventDate.getFullYear(),
    nextEventDate.getMonth(),
    nextEventDate.getDate(),
  );

  const diff = eventDate.getTime() - todayDate.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    eventCountdown.textContent = `🎂 Birthday in ${days} day${days !== 1 ? "s" : ""}`;
  } else if (days === 0) {
    eventCountdown.textContent = "🎉 Event is TODAY!";
  } else {
    eventCountdown.textContent = `Event passed ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
  }
}

// GOAL TRACKER FUNCTIONS
function loadGoal() {
  try {
    const savedGoal = localStorage.getItem("mainGoal");
    const savedStreak = localStorage.getItem("goalStreak");

    if (savedGoal) {
      mainGoal = JSON.parse(savedGoal);
    }

    if (savedStreak) {
      goalStreak = parseInt(savedStreak);
    }
  } catch (e) {
    console.log("Error loading goal:", e);
    mainGoal = null;
    goalStreak = 0;
  }
}

function checkNewDay() {
  if (!mainGoal || !mainGoal.lastUpdatedDate) return;

  const today = new Date().toDateString();
  const lastUpdated = new Date(mainGoal.lastUpdatedDate).toDateString();

  if (lastUpdated !== today) {
    // It's a new day, enable the action button
    if (startGoalBtn) startGoalBtn.disabled = false;
    updateButtonText("active");
  }
}

function updateGoalUI() {
  if (!goalInput || !goalTimeline || !goalProgressBar || !goalProgressText)
    return;

  if (!mainGoal) {
    // No goal set
    goalInput.disabled = false;
    goalTimeline.disabled = false;
    goalInput.value = "";
    goalTimeline.value = "30";
    if (goalProgressPercent) goalProgressPercent.textContent = "0%";
    if (goalProgressBar) goalProgressBar.style.width = "0%";
    if (goalProgressText)
      goalProgressText.textContent = "What do you wish to conquer?";
    if (goalStreakCount) goalStreakCount.textContent = "0";
    if (completionBadge) completionBadge.classList.remove("visible");

    if (startGoalBtn) {
      startGoalBtn.innerHTML =
        '<span class="btn-text">Chase Your Goal!</span><i class="fas fa-running btn-icon"></i>';
      startGoalBtn.disabled = false;
    }

    if (editGoalBtn) {
      editGoalBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editGoalBtn.style.display = "none";
    }

    return;
  }

  // Goal exists, update UI
  goalInput.value = mainGoal.text;
  goalInput.disabled = !isEditing;
  goalTimeline.value = mainGoal.totalDays.toString();
  goalTimeline.disabled = !isEditing;

  // Calculate progress
  const todayIndex = Math.min(mainGoal.currentDay, mainGoal.totalDays);
  const percentage = (todayIndex / mainGoal.totalDays) * 100;
  const percentageFixed = percentage.toFixed(1);

  // Update progress elements
  if (goalProgressPercent)
    goalProgressPercent.textContent = `${percentageFixed}%`;
  if (goalProgressBar) goalProgressBar.style.width = `${percentage}%`;
  if (goalProgressText) {
    goalProgressText.textContent = `"${mainGoal.text}" – Day ${todayIndex} of ${mainGoal.totalDays} (${percentageFixed}%)`;
  }
  if (goalStreakCount) goalStreakCount.textContent = goalStreak;

  // Update button state
  const today = new Date().toDateString();
  const lastUpdated = mainGoal.lastUpdatedDate
    ? new Date(mainGoal.lastUpdatedDate).toDateString()
    : null;

  if (lastUpdated === today) {
    if (startGoalBtn) {
      startGoalBtn.disabled = true;
      updateButtonText("completed");
    }
  } else {
    if (startGoalBtn) {
      startGoalBtn.disabled = false;
      updateButtonText("active");
    }
  }

  // Show trophy if goal completed
  if (completionBadge) {
    if (todayIndex >= mainGoal.totalDays) {
      completionBadge.classList.add("visible");
      if (goalProgressText) goalProgressText.classList.add("celebrating");
    } else {
      completionBadge.classList.remove("visible");
      if (goalProgressText) goalProgressText.classList.remove("celebrating");
    }
  }

  // Show edit button
  if (editGoalBtn) {
    editGoalBtn.style.display = "block";
  }
}

function updateButtonText(state) {
  if (!startGoalBtn) return;

  const btnText = startGoalBtn.querySelector(".btn-text");
  const btnIcon = startGoalBtn.querySelector(".btn-icon");

  if (!btnText || !btnIcon) return;

  switch (state) {
    case "start":
      btnText.textContent = "Chase Your Goal!";
      btnIcon.className = "fas fa-running btn-icon";
      break;
    case "active":
      btnText.textContent = "I showed up today";
      btnIcon.className = "fas fa-check-circle btn-icon";
      break;
    case "completed":
      btnText.textContent = "Keep it up, champ!";
      btnIcon.className = "fas fa-trophy btn-icon";
      break;
  }
}

function createConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  const goalCard = document.querySelector(".goal-tracker-card");
  if (!goalCard) return;

  goalCard.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
    ][Math.floor(Math.random() * 5)];
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    const animation = confetti.animate(
      [
        { opacity: 0, transform: "translateY(0) rotate(0deg)" },
        {
          opacity: 1,
          transform: `translateY(${Math.random() * 100}px) rotate(${Math.random() * 360}deg)`,
        },
        {
          opacity: 0,
          transform: `translateY(${100 + Math.random() * 100}px) rotate(${Math.random() * 720}deg)`,
        },
      ],
      {
        duration: 1500 + Math.random() * 1000,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    );

    container.appendChild(confetti);

    animation.onfinish = () => {
      confetti.remove();
    };
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.remove();
    }
  }, 2500);
}

// Handle edit button click
function handleEditGoalClick() {
  if (!mainGoal || !editGoalBtn) return;

  isEditing = !isEditing;

  if (isEditing) {
    editGoalBtn.innerHTML = '<i class="fas fa-save"></i>';
    editGoalBtn.title = "Save changes";
    if (goalInput) goalInput.disabled = false;
    if (goalTimeline) goalTimeline.disabled = false;
  } else {
    editGoalBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editGoalBtn.title = "Edit goal";

    // Save changes
    if (goalInput) mainGoal.text = goalInput.value.trim();
    if (goalTimeline) mainGoal.totalDays = parseInt(goalTimeline.value);

    localStorage.setItem("mainGoal", JSON.stringify(mainGoal));
    updateGoalUI();
  }
}

// Handle start/increment goal button
function handleGoalButtonClick() {
  if (!goalInput || !goalTimeline) return;

  if (!mainGoal) {
    // Starting a new goal
    const goalText = goalInput.value.trim();
    const totalDays = parseInt(goalTimeline.value);

    if (!goalText || goalText.length < 3) {
      showMessage(
        "Please enter a meaningful goal! (min 3 characters)",
        "error",
      );
      return;
    }

    if (!totalDays || totalDays < 1) {
      showMessage("Please select a timeline!", "error");
      return;
    }

    mainGoal = {
      text: goalText,
      totalDays: totalDays,
      currentDay: 0,
      startDate: new Date().toISOString(),
      lastUpdatedDate: null,
    };

    // Start streak
    goalStreak = 1;

    showMessage("Goal set! Let the journey begin! 🚀", "success");
  } else {
    // Increment goal for today
    const today = new Date().toDateString();
    const lastUpdated = mainGoal.lastUpdatedDate
      ? new Date(mainGoal.lastUpdatedDate).toDateString()
      : null;

    if (lastUpdated === today) {
      showMessage("You already checked in today! Come back tomorrow.", "info");
      return;
    }

    // Check if yesterday was also updated for streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastUpdated === yesterday.toDateString()) {
      goalStreak += 1;
    } else {
      goalStreak = 1; // Streak broken
    }

    mainGoal.currentDay += 1;
    mainGoal.lastUpdatedDate = new Date().toISOString();

    // Visual feedback
    createConfetti();
    if (startGoalBtn) {
      startGoalBtn.classList.add("celebrating");
      setTimeout(() => {
        startGoalBtn.classList.remove("celebrating");
      }, 500);
    }

    // Show motivational messages
    const messages = [
      "Amazing work today! 💪",
      "Consistency is key! 🔑",
      "One step closer to greatness! 🏆",
      "You're crushing it! 🚀",
      "Small steps, big results! 📈",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showMessage(randomMessage, "success");

    // Update general streak
    generalStreak += 1;
    localStorage.setItem("streak", generalStreak.toString());
    updateStreak();

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }

  // Save and update UI
  localStorage.setItem("mainGoal", JSON.stringify(mainGoal));
  localStorage.setItem("goalStreak", goalStreak.toString());

  updateGoalUI();
  updateButtonText("completed");
}

function showMessage(text, type) {
  const message = document.createElement("div");
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6"};
    color: white;
    border-radius: 10px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (message.parentNode) {
        document.body.removeChild(message);
      }
    }, 300);
  }, 3000);
}

function updateStreak() {
  if (streakCount) {
    streakCount.textContent = `${generalStreak} consecutive day${generalStreak !== 1 ? "s" : ""}`;
  }
}

// Initialize goal tracker
function initGoalTracker() {
  loadGoal();
  updateGoalUI();

  // Set up event listeners
  if (editGoalBtn) {
    editGoalBtn.addEventListener("click", handleEditGoalClick);
  }

  if (startGoalBtn) {
    startGoalBtn.addEventListener("click", handleGoalButtonClick);
  }

  // Add animations to CSS if not already present
  if (!document.getElementById("goal-animations")) {
    const style = document.createElement("style");
    style.id = "goal-animations";
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes firePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }
      
      @keyframes trophySpin {
        0% {
          transform: rotate(0) scale(0);
        }
        50% {
          transform: rotate(180deg) scale(1.5);
        }
        100% {
          transform: rotate(360deg) scale(1);
        }
      }
      
      @keyframes celebrate {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize the app
function initApp() {
  // Initialize theme
  initTheme();

  // Set up theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Initialize goal tracker
  initGoalTracker();

  // Initial UI updates
  updateGoalUI();
  updateStreak();
  updateDateTime();

  // Set up interval for updates
  setInterval(updateDateTime, 1000);

  // Service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  }
}

// Start the app
document.addEventListener("DOMContentLoaded", initApp);
