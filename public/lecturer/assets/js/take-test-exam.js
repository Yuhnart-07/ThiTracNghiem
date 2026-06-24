/* global window, document, localStorage, setInterval, clearInterval, alert, fetch */
document.addEventListener("DOMContentLoaded", () => {
  // Load data from localStorage
  const questionsStr = localStorage.getItem("trial_exam_questions");
  const infoStr = localStorage.getItem("trial_exam_info");
  const startTimeStr = localStorage.getItem("trial_exam_start_time");

  if (!questionsStr || !infoStr || !startTimeStr) {
    window.location.href = "/lecturer/test-exam";
    return;
  }

  const questions = JSON.parse(questionsStr);
  const info = JSON.parse(infoStr);
  const totalQuestions = info.soCauThi;
  
  // Calculate remaining seconds
  const startTime = new Date(startTimeStr);
  const elapsedSeconds = Math.floor((new Date() - startTime) / 1000);
  const totalSeconds = info.thoiGian * 60;
  let remainingSeconds = totalSeconds - elapsedSeconds;

  let currentIndex = 0;
  const userAnswers = JSON.parse(localStorage.getItem("trial_answers") || "{}");

  // DOM elements cache
  const gridContainer = document.getElementById("question-grid");
  const examMain = document.getElementById("exam-main");
  const footer = examMain.querySelector(".exam-footer");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const currentNumEl = document.getElementById("current-question-num");
  const timerEl = document.getElementById("countdown-timer");
  const btnFinish = document.getElementById("btn-finish");
  
  const submitModal = document.getElementById("submit-modal");
  const btnModalCancel = document.getElementById("btn-modal-cancel");
  const btnModalConfirm = document.getElementById("btn-modal-confirm");

  // 1. Set header information
  document.getElementById("header-subject-name").textContent = info.tenMonHoc;
  document.getElementById("total-question-num").textContent = ` / ${totalQuestions}`;

  // 2. Escape HTML helper
  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 3. Render Navigator Grid
  gridContainer.innerHTML = questions.map((q, idx) => `
    <div class="grid-item" data-index="${idx}" data-question-id="${q.id}">
      ${q.stt}
    </div>
  `).join("");

  // 4. Render Question Cards
  const cardsHtml = questions.map((q, idx) => `
    <div class="question-card" id="question-card-${idx}" data-index="${idx}" data-question-id="${q.id}" style="${idx === 0 ? 'display: flex;' : 'display: none;'}">
      <div class="question-header">
        <span class="question-number">Câu ${q.stt}:</span>
        <span class="question-text-content">${escapeHTML(q.noiDung)}</span>
      </div>
      <div class="options-list">
        ${Object.entries(q.options).map(([key, val]) => val ? `
          <div class="option-item" data-option="${key}">
            <div class="option-prefix">${key}</div>
            <div class="option-text">${escapeHTML(val)}</div>
          </div>
        ` : "").join("")}
      </div>
    </div>
  `).join("");

  // Insert question cards and move footer to the end
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cardsHtml;
  while (tempDiv.firstChild) {
    examMain.insertBefore(tempDiv.firstChild, footer);
  }

  const gridItems = document.querySelectorAll(".grid-item");
  const questionCards = document.querySelectorAll(".question-card");

  // 5. Restore answers from localStorage cache (Restore selected state)
  restoreCachedAnswers();

  // Initialize Timer
  const timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      handleAutoSubmit();
      return;
    }
    remainingSeconds--;
    updateTimerDisplay(remainingSeconds);
  }, 1000);

  updateTimerDisplay(remainingSeconds);

  function updateNavigation() {
    questionCards.forEach((card, idx) => {
      card.style.display = idx === currentIndex ? "flex" : "none";
    });

    gridItems.forEach((item, idx) => {
      if (idx === currentIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === totalQuestions - 1;
    currentNumEl.textContent = currentIndex + 1;
  }

  function updateTimerDisplay(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    
    const hStr = h > 0 ? String(h).padStart(2, "0") + ":" : "";
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");

    timerEl.textContent = `${hStr}${mStr}:${sStr}`;

    if (sec < 300) {
      timerEl.style.color = "#ef4444";
      timerEl.style.borderColor = "#ef4444";
      timerEl.style.backgroundColor = "#fef2f2";
    }
  }

  // Handle Option Selection
  questionCards.forEach((card) => {
    const optionItems = card.querySelectorAll(".option-item");
    const questionId = card.dataset.questionId;

    optionItems.forEach((option) => {
      option.addEventListener("click", () => {
        if (document.body.classList.contains("review-mode")) return;
        optionItems.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
        const selectedValue = option.dataset.option;

        // Save selection
        userAnswers[questionId] = selectedValue;
        localStorage.setItem("trial_answers", JSON.stringify(userAnswers));

        // Grid update
        const gridItem = document.querySelector(`.grid-item[data-question-id="${questionId}"]`);
        if (gridItem) {
          gridItem.classList.add("answered");
        }
      });
    });
  });

  function restoreCachedAnswers() {
    Object.entries(userAnswers).forEach(([qId, val]) => {
      const card = document.querySelector(`.question-card[data-question-id="${qId}"]`);
      if (card) {
        const optionEl = card.querySelector(`.option-item[data-option="${val}"]`);
        if (optionEl) {
          optionEl.classList.add("selected");
        }
        const gridItem = document.querySelector(`.grid-item[data-question-id="${qId}"]`);
        if (gridItem) {
          gridItem.classList.add("answered");
        }
      }
    });
  }

  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateNavigation();
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentIndex < totalQuestions - 1) {
      currentIndex++;
      updateNavigation();
    }
  });

  gridItems.forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.index);
      if (!isNaN(index)) {
        currentIndex = index;
        updateNavigation();
      }
    });
  });

  // Submit Modal Actions
  btnFinish.addEventListener("click", () => {
    let unansweredCount = 0;
    gridItems.forEach((item) => {
      if (!item.classList.contains("answered")) {
        unansweredCount++;
      }
    });

    const modalDesc = submitModal.querySelector(".modal-desc");
    if (unansweredCount > 0) {
      modalDesc.innerHTML = `Bạn có <strong>${unansweredCount} câu chưa chọn đáp án</strong>. Xác nhận nộp bài thi thử?`;
    } else {
      modalDesc.textContent = "Bạn đã trả lời đầy đủ các câu hỏi. Xác nhận nộp bài thi thử?";
    }

    submitModal.style.display = "flex";
  });

  btnModalCancel.addEventListener("click", () => {
    submitModal.style.display = "none";
  });

  btnModalConfirm.addEventListener("click", () => {
    submitExam();
  });

  async function submitExam() {
    clearInterval(timerInterval);
    btnModalConfirm.disabled = true;
    btnModalConfirm.textContent = "Đang chấm điểm...";

    const questionIdsList = questions.map(q => q.id);

    try {
      const response = await fetch("/lecturer/test-exam/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questions: questionIdsList,
          answers: userAnswers
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Clear cached exam elements
        localStorage.removeItem("trial_exam_questions");
        localStorage.removeItem("trial_exam_info");
        localStorage.removeItem("trial_exam_start_time");
        localStorage.removeItem("trial_answers");

        // Transition UI to Review mode
        document.body.classList.add("review-mode");
        submitModal.style.display = "none";
        
        // Show score text
        const scoreTextEl = document.getElementById("score-text");
        if (scoreTextEl) {
          scoreTextEl.textContent = `Điểm: ${result.score} (${result.correctCount}/${totalQuestions})`;
        }

        // Highlight questions details
        questionCards.forEach((card) => {
          const qId = card.dataset.questionId;
          const grading = result.results[qId] || { correct: "", selected: "", isCorrect: false };

          // Option highlighting
          const optionItems = card.querySelectorAll(".option-item");
          optionItems.forEach((opt) => {
            const optVal = opt.dataset.option;
            opt.classList.remove("selected"); // Remove standard highlights
            
            if (optVal === grading.correct) {
              opt.classList.add("correct");
            } else if (optVal === grading.selected && !grading.isCorrect) {
              opt.classList.add("incorrect");
            }
          });

          // Navigator grid color coding
          const gridItem = document.querySelector(`.grid-item[data-question-id="${qId}"]`);
          if (gridItem) {
            gridItem.classList.remove("answered");
            if (grading.isCorrect) {
              gridItem.classList.add("correct");
            } else {
              gridItem.classList.add("incorrect");
            }
          }
        });

        // Reset navigation visibility to page 1
        currentIndex = 0;
        updateNavigation();
      } else {
        alert("Lỗi chấm điểm: " + result.message);
        btnModalConfirm.disabled = false;
        btnModalConfirm.textContent = "Xác nhận nộp";
      }
    } catch {
      alert("Lỗi kết nối. Không thể nộp bài.");
      btnModalConfirm.disabled = false;
      btnModalConfirm.textContent = "Xác nhận nộp";
    }
  }

  function handleAutoSubmit() {
    alert("Hết giờ làm bài! Hệ thống tự động chấm bài thi thử của bạn.");
    submitExam();
  }

  // Keyboard Navigation Shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "ArrowLeft") {
      btnPrev.click();
    } else if (e.key === "ArrowRight") {
      btnNext.click();
    } else if (!document.body.classList.contains("review-mode") && ["a", "b", "c", "d", "A", "B", "C", "D"].includes(e.key)) {
      const keyUpper = e.key.toUpperCase();
      const activeCard = questionCards[currentIndex];
      if (activeCard) {
        const optionEl = activeCard.querySelector(`.option-item[data-option="${keyUpper}"]`);
        if (optionEl) {
          optionEl.click();
        }
      }
    }
  });

  // Initial navigation update
  updateNavigation();
});
