/**
 * NutriMess AI - Core Frontend Script
 * Handles Theme Toggling, Image Processing, API Calls, Calculators,
 * LocalStorage History, and PDF Generation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global App State
  let currentImageBase64 = null;
  let currentAnalysisResult = null;
  let unitSystemBMI = "metric"; // metric or imperial

  // DOM Elements
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIcon = themeToggleBtn.querySelector("i");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  const dropZone = document.getElementById("drop-zone");
  const imageUploadInput = document.getElementById("image-upload");
  const browseBtn = document.getElementById("browse-btn");
  const previewContainer = document.getElementById("preview-container");
  const imagePreview = document.getElementById("image-preview");
  const removeImgBtn = document.getElementById("remove-img-btn");
  const analyzeBtn = document.getElementById("analyze-btn");

  const analysisLoader = document.getElementById("analysis-loader");
  const loaderStatus = document.getElementById("loader-status");

  const resultsPlaceholder = document.getElementById("results-placeholder");
  const resultsPanel = document.getElementById("results-panel");
  const resultTimestamp = document.getElementById("result-timestamp");
  const resultHealthScore = document.getElementById("result-health-score");
  const scoreRingPath = document.getElementById("score-ring-path");
  const resultHealthRing = document.getElementById("result-health-ring");
  const healthScoreLabel = document.getElementById("health-score-label");

  const resultCalories = document.getElementById("result-calories");
  const resultProtein = document.getElementById("result-protein");
  const resultCarbs = document.getElementById("result-carbs");
  const resultFats = document.getElementById("result-fats");

  const caloriesProgress = document.getElementById("calories-progress");
  const proteinProgress = document.getElementById("protein-progress");
  const carbsProgress = document.getElementById("carbs-progress");
  const fatsProgress = document.getElementById("fats-progress");

  const resultFoodItems = document.getElementById("result-food-items");
  const resultStrengths = document.getElementById("result-strengths");
  const resultWeaknesses = document.getElementById("result-weaknesses");
  const resultSuggestions = document.getElementById("result-suggestions");

  const downloadReportBtn = document.getElementById("download-report-btn");
  const saveHistoryBtn = document.getElementById("save-history-btn");

  const historyListPlaceholder = document.getElementById("history-list-placeholder");
  const historyTable = document.getElementById("history-table");
  const historyTableBody = document.getElementById("history-table-body");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  // Calculator Elements
  const calcTabBtns = document.querySelectorAll(".calc-tab-btn");
  const calcPanes = document.querySelectorAll(".calc-content-pane");

  const bmiForm = document.getElementById("bmi-form");
  const bmiMetricBtn = document.getElementById("bmi-metric-btn");
  const bmiImperialBtn = document.getElementById("bmi-imperial-btn");
  const heightMetricGroup = document.getElementById("height-metric-group");
  const heightImperialGroup = document.getElementById("height-imperial-group");
  const bmiWeightInput = document.getElementById("bmi-weight");
  const bmiHeightCmInput = document.getElementById("bmi-height-cm");
  const bmiHeightFtInput = document.getElementById("bmi-height-ft");
  const bmiHeightInInput = document.getElementById("bmi-height-in");
  const lblWeight = document.getElementById("lbl-weight");
  const bmiResultPlaceholder = document.getElementById("bmi-result-placeholder");
  const bmiResultDisplay = document.getElementById("bmi-result-display");
  const bmiScore = document.getElementById("bmi-score");
  const bmiStatus = document.getElementById("bmi-status");
  const bmiSuggestion = document.getElementById("bmi-suggestion");
  const bmiPointer = document.getElementById("bmi-pointer");

  const calorieForm = document.getElementById("calorie-form");
  const calorieResultPlaceholder = document.getElementById("calorie-result-placeholder");
  const calorieResultDisplay = document.getElementById("calorie-result-display");
  const calorieTdee = document.getElementById("calorie-tdee");
  const macroSplitProtein = document.getElementById("macro-split-protein");
  const macroSplitCarbs = document.getElementById("macro-split-carbs");
  const macroSplitFats = document.getElementById("macro-split-fats");

  /* ==========================================================================
     THEME / NAVIGATION MANAGEMENT
     ========================================================================== */

  // Initialize Theme
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    themeIcon.className = "fa-solid fa-sun";
  }

  // Toggle Theme
  themeToggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      themeIcon.className = "fa-solid fa-moon";
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      themeIcon.className = "fa-solid fa-sun";
      localStorage.setItem("theme", "dark");
    }
  });

  // Mobile Navigation toggle
  mobileMenuBtn.addEventListener("click", () => {
    const isVisible = mobileNav.style.display === "flex";
    mobileNav.style.display = isVisible ? "none" : "flex";
    const barIcon = mobileMenuBtn.querySelector("i");
    barIcon.className = isVisible ? "fa-solid fa-bars" : "fa-solid fa-xmark";
  });

  // Smooth scroll and active state on nav links
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // Close mobile nav on click
      mobileNav.style.display = "none";
      mobileMenuBtn.querySelector("i").className = "fa-solid fa-bars";

      // Toggle active link class
      navLinks.forEach(n => n.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Active navigation highlight on scroll
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 100;
    const sections = ["hero", "analyzer", "calculators", "history"];
    
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(n => {
            const href = n.getAttribute("href");
            if (href === `#${secId}`) {
              n.classList.add("active");
            } else {
              n.classList.remove("active");
            }
          });
        }
      }
    });
  });

  /* ==========================================================================
     IMAGE UPLOAD AND PREPROCESSING
     ========================================================================== */

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Add highlight styles on dragover
  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add("dragover"), false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove("dragover"), false);
  });

  // Handle dropped files
  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  // Trigger browse click
  browseBtn.addEventListener("click", () => imageUploadInput.click());
  imageUploadInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  // Remove selected image
  removeImgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUpload();
  });

  // Process selected image file
  function handleImageFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, or JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawBase64 = e.target.result;
      
      // Compress the image for API upload (max 1024px, 0.8 quality) to stay under Vercel's payload limit (4.5MB)
      compressImageForUpload(rawBase64, 1024, 1024, (compressedBase64) => {
        currentImageBase64 = compressedBase64;
        imagePreview.src = compressedBase64;
        previewContainer.classList.remove("hidden");
        analyzeBtn.disabled = false;
      });
    };
    reader.readAsDataURL(file);
  }

  // Helper to compress base64 images before upload
  function compressImageForUpload(base64Str, maxWidth, maxHeight, callback) {
    if (!base64Str) {
      callback(null);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as JPG at 0.8 quality to minimize payload size
      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      callback(compressed);
    };
    img.onerror = () => {
      // Fallback to original if canvas operations fail
      callback(base64Str);
    };
  }

  function resetUpload() {
    currentImageBase64 = null;
    imagePreview.src = "";
    previewContainer.classList.add("hidden");
    imageUploadInput.value = "";
    analyzeBtn.disabled = true;
  }

  /* ==========================================================================
     API ANALYSIS INTEGRATION
     ========================================================================== */

  // Trigger Gemini Analysis
  analyzeBtn.addEventListener("click", async () => {
    if (!currentImageBase64) return;

    // Show loading state
    analysisLoader.classList.remove("hidden");
    analyzeBtn.disabled = true;
    
    // Animate loader texts
    const statuses = [
      "Uploading Meal Image...",
      "AI is inspecting the food elements...",
      "Analyzing plate portions...",
      "Calculating calories & macros...",
      "Formatting dietitian tips..."
    ];
    let statusIndex = 0;
    loaderStatus.textContent = statuses[0];
    
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      loaderStatus.textContent = statuses[statusIndex];
    }, 1500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: currentImageBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      currentAnalysisResult = result;
      
      // Render results
      renderAnalysis(result);
      
      // Smooth scroll to results
      resultsPanel.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      console.error(err);
      alert(`Analysis Failed: ${err.message || "An unknown error occurred. Make sure your Gemini API key is configured."}`);
    } finally {
      clearInterval(statusInterval);
      analysisLoader.classList.add("hidden");
      analyzeBtn.disabled = false;
    }
  });

  // Render analysis in the UI
  function renderAnalysis(data) {
    resultsPlaceholder.classList.add("hidden");
    resultsPanel.classList.remove("hidden");

    // Timestamp
    const now = new Date();
    resultTimestamp.textContent = `Analyzed on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
    document.getElementById("pdf-date").textContent = `Date: ${now.toLocaleDateString()}`;

    // Health Score Chart Ring animation
    const scoreVal = parseInt(data.healthScore) || 0;
    animateHealthScoreRing(scoreVal);

    // Food Items badges
    resultFoodItems.innerHTML = "";
    if (data.foodItems && Array.isArray(data.foodItems)) {
      data.foodItems.forEach(item => {
        const badge = document.createElement("span");
        badge.className = "badge-item";
        badge.innerHTML = `<i class="fa-solid fa-apple-whole"></i> ${item}`;
        resultFoodItems.appendChild(badge);
      });
    }

    // Calories & Macro values
    resultCalories.textContent = data.calories || "0 kcal";
    resultProtein.textContent = data.protein || "0g";
    resultCarbs.textContent = data.carbohydrates || "0g";
    resultFats.textContent = data.fat || "0g";

    // Helper to extract digits from string safely (e.g. "650 kcal" -> 650, "approx 25g" -> 25)
    function parseNumberSafely(str) {
      if (!str) return 0;
      const match = String(str).match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }

    // Progress Bars (Standard Daily reference values: Cal 2000, Pro 80g, Carb 250g, Fat 70g)
    const calInt = parseNumberSafely(data.calories);
    const proInt = parseNumberSafely(data.protein);
    const carbInt = parseNumberSafely(data.carbohydrates);
    const fatInt = parseNumberSafely(data.fat);

    caloriesProgress.style.width = `${Math.min((calInt / 2000) * 100, 100)}%`;
    proteinProgress.style.width = `${Math.min((proInt / 80) * 100, 100)}%`;
    carbsProgress.style.width = `${Math.min((carbInt / 250) * 100, 100)}%`;
    fatsProgress.style.width = `${Math.min((fatInt / 70) * 100, 100)}%`;

    // Lists
    renderBulletList(resultStrengths, data.strengths);
    renderBulletList(resultWeaknesses, data.weaknesses);
    renderBulletList(resultSuggestions, data.suggestions);

    // Reset save button state
    saveHistoryBtn.disabled = false;
    saveHistoryBtn.innerHTML = `<i class="fa-solid fa-bookmark mr-1"></i> Save Report`;
  }

  function renderBulletList(containerEl, itemsArray) {
    containerEl.innerHTML = "";
    if (itemsArray && Array.isArray(itemsArray)) {
      itemsArray.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        containerEl.appendChild(li);
      });
    } else {
      containerEl.innerHTML = "<li>None noted.</li>";
    }
  }

  function animateHealthScoreRing(score) {
    // Determine ring coloration class
    resultHealthRing.className = "circular-chart"; // reset
    let label = "Balanced";
    if (score >= 75) {
      resultHealthRing.classList.add("green");
      label = "Highly Nutritious";
    } else if (score >= 40) {
      resultHealthRing.classList.add("amber");
      label = "Moderately Balanced";
    } else {
      resultHealthRing.classList.add("red");
      label = "Nutritionally Deficient";
    }
    
    healthScoreLabel.textContent = label;

    // SVG dasharray animation (circumference of 15.9155 radius is exactly 100)
    let currentScore = 0;
    const speed = 15;
    const interval = setInterval(() => {
      if (currentScore >= score) {
        clearInterval(interval);
      } else {
        currentScore++;
        resultHealthScore.textContent = currentScore;
        scoreRingPath.setAttribute("stroke-dasharray", `${currentScore}, 100`);
      }
    }, speed);
  }

  /* ==========================================================================
     LOCAL STORAGE HISTORY
     ========================================================================== */

  // Load History on Boot
  loadHistory();

  // Save to history button click
  saveHistoryBtn.addEventListener("click", () => {
    if (!currentAnalysisResult) return;
    
    saveToHistory(currentAnalysisResult, currentImageBase64);
    saveHistoryBtn.disabled = true;
    saveHistoryBtn.innerHTML = `<i class="fa-solid fa-check mr-1"></i> Saved`;
  });

  // Clear all history
  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all saved meal analyses? This action is irreversible.")) {
      localStorage.removeItem("nutritionHistory");
      loadHistory();
    }
  });

  // Save item function
  function saveToHistory(resultData, base64Image) {
    let history = JSON.parse(localStorage.getItem("nutritionHistory")) || [];

    // Compress base64Image into a smaller thumbnail (approx 80x80px) to prevent exceeding LocalStorage quota
    compressImageToThumbnail(base64Image, 80, 80, (thumbBase64) => {
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnail: thumbBase64,
        healthScore: resultData.healthScore,
        calories: resultData.calories,
        protein: resultData.protein,
        carbs: resultData.carbohydrates,
        fat: resultData.fat,
        foodItems: resultData.foodItems || [],
        fullData: resultData // Save the raw analysis result object
      };

      // Add to front of history list
      history.unshift(historyItem);
      localStorage.setItem("nutritionHistory", JSON.stringify(history));
      loadHistory();
    });
  }

  // Compress image helper using canvas
  function compressImageToThumbnail(base64Str, maxWidth, maxHeight, callback) {
    if (!base64Str) {
      callback(null);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as small JPG quality 0.7
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressed);
    };
    img.onerror = () => {
      callback(null);
    };
  }

  // Load and render history table
  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("nutritionHistory")) || [];

    if (history.length === 0) {
      historyListPlaceholder.classList.remove("hidden");
      historyTable.classList.add("hidden");
      clearHistoryBtn.classList.add("hidden");
      return;
    }

    historyListPlaceholder.classList.add("hidden");
    historyTable.classList.remove("hidden");
    clearHistoryBtn.classList.remove("hidden");

    historyTableBody.innerHTML = "";
    history.forEach((item, index) => {
      const tr = document.createElement("tr");

      // Score badge class
      const score = parseInt(item.healthScore) || 0;
      let scoreClass = "med";
      if (score >= 75) scoreClass = "high";
      if (score < 40) scoreClass = "low";

      const primaryMeal = item.foodItems[0] || "Unknown meal";
      const totalCount = item.foodItems.length;
      const mealName = totalCount > 1 ? `${primaryMeal} +${totalCount - 1}` : primaryMeal;

      tr.innerHTML = `
        <td>
          <div class="meal-thumbnail-wrap">
            ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${primaryMeal}" class="meal-thumb">` : `<div class="meal-thumb flex-center" style="background:#e2e8f0;"><i class="fa-solid fa-plate-wheat"></i></div>`}
            <span class="font-semibold">${mealName}</span>
          </div>
        </td>
        <td>${item.date} <span class="text-muted text-sm">${item.timestamp}</span></td>
        <td><span class="history-score-tag ${scoreClass}">${item.healthScore}</span></td>
        <td class="font-medium">${item.calories}</td>
        <td class="text-sm text-secondary">${item.protein} / ${item.carbs} / ${item.fat}</td>
        <td class="text-right no-print">
          <button class="icon-btn btn-view-history btn-sm" data-index="${index}" title="View Report">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="icon-btn btn-delete-history btn-sm ml-2" data-index="${index}" title="Delete" style="color:var(--danger); border-color:rgba(239, 68, 68, 0.2)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      historyTableBody.appendChild(tr);
    });

    // Attach event listeners to history actions
    document.querySelectorAll(".btn-view-history").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = history[index];
        if (item && item.fullData) {
          // Temporarily mock image preview if available
          if (item.thumbnail) {
            imagePreview.src = item.thumbnail;
            previewContainer.classList.remove("hidden");
          }
          currentAnalysisResult = item.fullData;
          renderAnalysis(item.fullData);
          resultsPanel.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    document.querySelectorAll(".btn-delete-history").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        deleteHistoryItem(index);
      });
    });
  }

  function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("nutritionHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("nutritionHistory", JSON.stringify(history));
    loadHistory();
  }

  /* ==========================================================================
     PDF EXPORT GENERATION
     ========================================================================== */

  downloadReportBtn.addEventListener("click", () => {
    if (!currentAnalysisResult) return;

    const reportElement = document.getElementById("pdf-report-area");
    const pdfHeader = reportElement.querySelector(".pdf-only-header");
    
    // Temporarily make PDF-specific header visible
    pdfHeader.style.display = "flex";

    const opt = {
      margin:       12,
      filename:     `NutriMess_Report_${Date.now()}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Run PDF builder and hide pdf header in callback
    html2pdf()
      .set(opt)
      .from(reportElement)
      .save()
      .then(() => {
        pdfHeader.style.display = "none";
      })
      .catch((err) => {
        console.error("PDF generation failed:", err);
        pdfHeader.style.display = "none";
        alert("Could not generate PDF. Please try again.");
      });
  });

  /* ==========================================================================
     CALCULATORS (BMI & CALORIE NEEDS)
     ========================================================================== */

  // Tabs switcher
  calcTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      calcTabBtns.forEach(b => b.classList.remove("active"));
      calcPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = btn.getAttribute("data-tab");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // BMI unit toggle
  bmiMetricBtn.addEventListener("click", () => {
    unitSystemBMI = "metric";
    bmiMetricBtn.classList.add("active");
    bmiImperialBtn.classList.remove("active");
    heightMetricGroup.classList.remove("hidden");
    heightImperialGroup.classList.add("hidden");
    bmiWeightInput.placeholder = "e.g. 70";
    lblWeight.textContent = "Weight (kg)";
    
    // Set required states
    bmiHeightCmInput.required = true;
    bmiHeightFtInput.required = false;
    bmiHeightInInput.required = false;
  });

  bmiImperialBtn.addEventListener("click", () => {
    unitSystemBMI = "imperial";
    bmiImperialBtn.classList.add("active");
    bmiMetricBtn.classList.remove("active");
    heightMetricGroup.classList.add("hidden");
    heightImperialGroup.classList.remove("hidden");
    bmiWeightInput.placeholder = "e.g. 154";
    lblWeight.textContent = "Weight (lbs)";

    // Set required states
    bmiHeightCmInput.required = false;
    bmiHeightFtInput.required = true;
    bmiHeightInInput.required = true;
  });

  // BMI Calculation form
  bmiForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const weight = parseFloat(bmiWeightInput.value);
    let bmiValue = 0;

    if (unitSystemBMI === "metric") {
      const heightCm = parseFloat(bmiHeightCmInput.value);
      const heightM = heightCm / 100;
      bmiValue = weight / (heightM * heightM);
    } else {
      const feet = parseFloat(bmiHeightFtInput.value);
      const inches = parseFloat(bmiHeightInInput.value) || 0;
      const totalInches = (feet * 12) + inches;
      bmiValue = (weight * 703) / (totalInches * totalInches);
    }

    if (isNaN(bmiValue) || bmiValue <= 0) return;

    // Show result
    bmiResultPlaceholder.classList.add("hidden");
    bmiResultDisplay.classList.remove("hidden");

    const formattedBmi = bmiValue.toFixed(1);
    bmiScore.textContent = formattedBmi;

    // Categorization
    let statusText = "";
    let suggestionText = "";
    let pointerPos = 50; // default middle

    if (bmiValue < 18.5) {
      statusText = "Underweight";
      suggestionText = "It is recommended to seek nutritional balance to reach a healthy weight.";
      // Map <18.5 to [2%, 25%]
      pointerPos = Math.max(2, ((bmiValue - 14) / (18.5 - 14)) * 25);
    } else if (bmiValue < 25) {
      statusText = "Normal Weight";
      suggestionText = "Fantastic! You are in a healthy, recommended weight range.";
      // Map [18.5, 25] to [25%, 50%]
      pointerPos = 25 + (((bmiValue - 18.5) / (25 - 18.5)) * 25);
    } else if (bmiValue < 30) {
      statusText = "Overweight";
      suggestionText = "Consider reviewing daily caloric limits and increasing activity levels.";
      // Map [25, 30] to [50%, 75%]
      pointerPos = 50 + (((bmiValue - 25) / (30 - 25)) * 25);
    } else {
      statusText = "Obese";
      suggestionText = "Prioritize consulting a dietitian or physical trainer to adjust habits.";
      // Map [30, 40] to [75%, 98%]
      pointerPos = Math.min(98, 75 + (((bmiValue - 30) / (40 - 30)) * 23));
    }

    bmiStatus.textContent = statusText;
    bmiSuggestion.textContent = suggestionText;
    bmiPointer.style.left = `${pointerPos}%`;
  });

  // Daily Calorie needs Calculator
  calorieForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const gender = document.getElementById("calc-gender").value;
    const age = parseInt(document.getElementById("calc-age").value);
    const weight = parseFloat(document.getElementById("calc-weight").value);
    const height = parseFloat(document.getElementById("calc-height").value);
    const activity = parseFloat(document.getElementById("calc-activity").value);
    const goal = document.getElementById("calc-goal").value;

    let bmr = 0;

    // Mifflin-St Jeor Formula
    if (gender === "male") {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const tdee = Math.round(bmr * activity);
    let targetCal = tdee;

    // Adjust target based on goal
    let goalFactorPro = 0.25;
    let goalFactorCarb = 0.45;
    let goalFactorFat = 0.30;

    if (goal === "lose-heavy") {
      targetCal = tdee - 500;
      goalFactorPro = 0.35; // high protein during calorie cut
      goalFactorCarb = 0.35;
    } else if (goal === "lose-light") {
      targetCal = tdee - 250;
      goalFactorPro = 0.30;
      goalFactorCarb = 0.40;
    } else if (goal === "gain-light") {
      targetCal = tdee + 250;
      goalFactorCarb = 0.50; // extra carbs to facilitate build
    } else if (goal === "gain-heavy") {
      targetCal = tdee + 500;
      goalFactorCarb = 0.50;
    }

    // Safeguard minimum healthy calories
    const minCals = gender === "male" ? 1500 : 1200;
    if (targetCal < minCals) targetCal = minCals;

    // Display calorie results
    calorieResultPlaceholder.classList.add("hidden");
    calorieResultDisplay.classList.remove("hidden");

    calorieTdee.textContent = targetCal.toLocaleString();

    // Compute macro recommendations in grams
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const proGrams = Math.round((targetCal * goalFactorPro) / 4);
    const carbGrams = Math.round((targetCal * goalFactorCarb) / 4);
    const fatGrams = Math.round((targetCal * goalFactorFat) / 9);

    macroSplitProtein.textContent = `${proGrams}g`;
    macroSplitCarbs.textContent = `${carbGrams}g`;
    macroSplitFats.textContent = `${fatGrams}g`;

    const proPctEl = macroSplitProtein.nextElementSibling;
    const carbPctEl = macroSplitCarbs.nextElementSibling;
    const fatPctEl = macroSplitFats.nextElementSibling;

    proPctEl.textContent = `(${Math.round(goalFactorPro * 100)}%)`;
    carbPctEl.textContent = `(${Math.round(goalFactorCarb * 100)}%)`;
    fatPctEl.textContent = `(${Math.round(goalFactorFat * 100)}%)`;
  });
});
