/* global window, document, localStorage, setInterval, clearInterval, alert, fetch */
document.addEventListener("DOMContentLoaded", () => {
  const config = window.EXAM_CONFIG || {};
  const baithiId = config.baithiId;
  const totalQuestions = config.totalQuestions;
  let remainingSeconds = config.remainingSeconds;

  let currentIndex = 0;

  // Cache DOM elements
  const gridItems = document.querySelectorAll(".grid-item");
  const questionCards = document.querySelectorAll(".question-card");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const currentNumEl = document.getElementById("current-question-num");
  const timerEl = document.getElementById("countdown-timer");
  const btnFinish = document.getElementById("btn-finish");
  
  const submitModal = document.getElementById("submit-modal");
  const btnModalCancel = document.getElementById("btn-modal-cancel");
  const btnModalConfirm = document.getElementById("btn-modal-confirm");

  // Load any unsaved answers from localStorage to server on startup (Sync back mechanism)
  syncLocalAnswersToServer();

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

  // Update navigation button states and numbers
  function updateNavigation() {
    // Show active card, hide others
    questionCards.forEach((card, idx) => {
      card.style.display = idx === currentIndex ? "flex" : "none";
    });

    // Update active class in grid
    gridItems.forEach((item, idx) => {
      if (idx === currentIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Button states
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === totalQuestions - 1;

    // Progress text
    currentNumEl.textContent = currentIndex + 1;
  }

  // Timer format display
  function updateTimerDisplay(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    
    const hStr = h > 0 ? String(h).padStart(2, "0") + ":" : "";
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");

    timerEl.textContent = `${hStr}${mStr}:${sStr}`;

    // Add alert styling if less than 5 minutes
    if (sec < 300) {
      timerEl.style.color = "#ef4444";
      timerEl.style.borderColor = "#ef4444";
      timerEl.style.backgroundColor = "#fef2f2";
    }
  }

  // Handle Question Card option selection
  questionCards.forEach((card) => {
    const optionItems = card.querySelectorAll(".option-item");
    const questionId = card.dataset.questionId;

    optionItems.forEach((option) => {
      option.addEventListener("click", () => {
        // Clear current selections on this card
        optionItems.forEach((opt) => opt.classList.remove("selected"));
        
        // Mark this option as selected
        option.classList.add("selected");
        const selectedValue = option.dataset.option;

        // Save to localStorage (Local cache for network resilience)
        localStorage.setItem(`baithi_${baithiId}_q_${questionId}`, selectedValue);

        // Update navigator grid state
        const matchingGridItem = document.querySelector(`.grid-item[data-question-id="${questionId}"]`);
        if (matchingGridItem) {
          matchingGridItem.classList.add("answered");
        }

        // Send AJAX request to Server
        saveAnswerToServer(baithiId, questionId, selectedValue);
      });
    });
  });

  // Save answer AJAX helper
  async function saveAnswerToServer(examId, qId, answer) {
    try {
      const response = await fetch("/client/exam/save-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          baithiId: examId,
          cauHoiId: qId,
          dapAnChon: answer
        })
      });
      const data = await response.json();
      if (!data.success) {
        console.error("Lưu đáp án lên server thất bại:", data.message);
      }
    } catch (e) {
      console.warn("Mất kết nối server, đáp án tạm thời được lưu trên trình duyệt.", e);
    }
  }

  // Sync back local storage cache to server on page reload / recovery
  function syncLocalAnswersToServer() {
    questionCards.forEach((card) => {
      const questionId = card.dataset.questionId;
      const cachedVal = localStorage.getItem(`baithi_${baithiId}_q_${questionId}`);
      if (cachedVal) {
        // Find option element
        const optionEl = card.querySelector(`.option-item[data-option="${cachedVal}"]`);
        if (optionEl && !optionEl.classList.contains("selected")) {
          // Update visual options and grid
          card.querySelectorAll(".option-item").forEach(opt => opt.classList.remove("selected"));
          optionEl.classList.add("selected");
          
          const gridItem = document.querySelector(`.grid-item[data-question-id="${questionId}"]`);
          if (gridItem) {
            gridItem.classList.add("answered");
          }
          
          // Send back to server
          saveAnswerToServer(baithiId, questionId, cachedVal);
        }
      }
    });
  }

  // Next / Prev Actions
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

  // Navigator Grid Actions
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
    // Check if any unanswered question
    let unansweredCount = 0;
    gridItems.forEach((item) => {
      if (!item.classList.contains("answered")) {
        unansweredCount++;
      }
    });

    const modalDesc = submitModal.querySelector(".modal-desc");
    if (unansweredCount > 0) {
      modalDesc.innerHTML = `Bạn có <strong>${unansweredCount} câu chưa trả lời</strong>. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?`;
    } else {
      modalDesc.textContent = "Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài?";
    }

    submitModal.style.display = "flex";
  });

  btnModalCancel.addEventListener("click", () => {
    submitModal.style.display = "none";
  });

  btnModalConfirm.addEventListener("click", async () => {
    clearInterval(timerInterval);
    btnModalConfirm.disabled = true;
    btnModalConfirm.textContent = "Đang nộp...";
    
    // Clear localStorage for this exam
    questionCards.forEach((card) => {
      const questionId = card.dataset.questionId;
      localStorage.removeItem(`baithi_${baithiId}_q_${questionId}`);
    });

    try {
      const response = await fetch(`/client/exam/submit/${baithiId}`, {
        method: "POST"
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirectUrl || "/client/exam-review";
      } else {
        alert("Có lỗi xảy ra khi nộp bài: " + result.message);
        btnModalConfirm.disabled = false;
        btnModalConfirm.textContent = "Xác nhận nộp";
      }
    } catch {
      alert("Lỗi kết nối. Vui lòng kiểm tra lại mạng và thử lại.");
      btnModalConfirm.disabled = false;
      btnModalConfirm.textContent = "Xác nhận nộp";
    }
  });

  // Automatic submit when time's up
  function handleAutoSubmit() {
    // Clear localStorage for this exam
    questionCards.forEach((card) => {
      const questionId = card.dataset.questionId;
      localStorage.removeItem(`baithi_${baithiId}_q_${questionId}`);
    });
    
    alert("Hết giờ làm bài! Hệ thống tự động nộp bài thi của bạn.");
    window.location.href = `/client/exam/submit-auto/${baithiId}`;
  }

  // Keyboard Navigation Shortcuts
  document.addEventListener("keydown", (e) => {
    // Prevent interfering with input tags if any
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "ArrowLeft") {
      btnPrev.click();
    } else if (e.key === "ArrowRight") {
      btnNext.click();
    } else if (["a", "b", "c", "d", "A", "B", "C", "D"].includes(e.key)) {
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
});
