const questionBankForm = document.querySelector("#questionBankForm");

if (questionBankForm) {
  const elements = {
    message: document.querySelector("#questionBankMessage"),
    questionId: document.querySelector("#questionId"),
    subject: document.querySelector("#subjectSelect"),
    content: document.querySelector("#questionContent"),
    answerA: document.querySelector("#answerA"),
    answerB: document.querySelector("#answerB"),
    answerC: document.querySelector("#answerC"),
    answerD: document.querySelector("#answerD"),
    tableBody: document.querySelector("#recordsTableBody"),
    paginationText: document.querySelector(".inner-pagination-text"),
    keyword: document.querySelector("#tableFilter"),
    modeBadge: document.querySelector("#modeBadge"),
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnExitMode: document.querySelector("#btnExitMode"),
    btnSave: document.querySelector("#btnSave"),
    btnKeywordSearch: document.querySelector("#btnKeywordSearch"),
    btnToggleFilters: document.querySelector("#btnToggleFilters"),
    filterPanel: document.querySelector("#questionFilterPanel"),
    filterSubject: document.querySelector("#filterSubject"),
    filterLevel: document.querySelector("#filterLevel"),
    filterSummary: document.querySelector("#filterSummary"),
    btnApplyFilters: document.querySelector("#btnApplyFilters"),
    btnClearFilters: document.querySelector("#btnClearFilters"),
    btnPrevPage: document.querySelector("#btnPrevPage"),
    btnNextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
    formBody: questionBankForm.querySelector(".inner-wrap"),
  };

  const canMutate = questionBankForm.dataset.canMutate === "true";
  const pageSize = 10;
  const state = {
    mode: "view",
    questions: [],
    selectedQuestionId: null,
    currentPage: 1,
  };

  const modeLabels = {
    view: "ĐANG XEM",
    create: "ĐANG THÊM",
    edit: "ĐANG SỬA",
    search: "ĐANG TÌM",
  };

  const setMessage = (message, type = "info") => {
    if (!elements.message) return;
    elements.message.textContent = message || "";
    elements.message.dataset.type = type;
    elements.message.classList.toggle("active", Boolean(message));
  };

  const isEditing = () => state.mode === "create" || state.mode === "edit";

  const getSelectedQuestion = () => state.questions.find((question) => question.cauHoi === state.selectedQuestionId);

  const setModeBadge = (mode) => {
    if (!elements.modeBadge) return;
    elements.modeBadge.textContent = modeLabels[mode] || modeLabels.view;
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Không thể xử lý yêu cầu.");
    }

    return data;
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getSelectedAnswer = () => {
    const checkedAnswer = questionBankForm.querySelector("input[name='correctAnswer']:checked");
    return checkedAnswer ? checkedAnswer.value : "";
  };

  const setSelectedAnswer = (answer) => {
    const input = questionBankForm.querySelector(`input[name='correctAnswer'][value='${answer || "A"}']`);
    if (input) input.checked = true;
  };

  const normalizeAnswerForCompare = (answer) => answer.trim().replace(/\s+/g, " ").toLowerCase();

  const findDuplicatedAnswerPair = (payload) => {
    const answers = [
      ["A", payload.dapAnA],
      ["B", payload.dapAnB],
      ["C", payload.dapAnC],
      ["D", payload.dapAnD],
    ];
    const seenAnswers = new Map();

    for (const [label, answer] of answers) {
      const normalizedAnswer = normalizeAnswerForCompare(answer);

      if (seenAnswers.has(normalizedAnswer)) {
        return [seenAnswers.get(normalizedAnswer), label];
      }

      seenAnswers.set(normalizedAnswer, label);
    }

    return null;
  };

  const getPayload = () => ({
    maMonHoc: elements.subject.value,
    trinhDo: questionBankForm.querySelector("input[name='level']:checked")?.value || "",
    noiDung: elements.content.value.trim(),
    dapAnA: elements.answerA.value.trim(),
    dapAnB: elements.answerB.value.trim(),
    dapAnC: elements.answerC.value.trim(),
    dapAnD: elements.answerD.value.trim(),
    dapAnDung: getSelectedAnswer(),
  });

  const validatePayload = (payload) => {
    if (!payload.maMonHoc) return "Vui lòng chọn môn học.";
    if (!["A", "B", "C"].includes(payload.trinhDo)) return "Trình độ chỉ được là A, B hoặc C.";
    if (!payload.noiDung) return "Vui lòng nhập nội dung câu hỏi.";
    if (!payload.dapAnA || !payload.dapAnB || !payload.dapAnC || !payload.dapAnD) {
      return "Vui lòng nhập đủ bốn đáp án A, B, C, D.";
    }
    if (!["A", "B", "C", "D"].includes(payload.dapAnDung)) return "Vui lòng chọn đáp án đúng.";
    if (payload.noiDung.length > 500) return "Nội dung câu hỏi không được vượt quá 500 ký tự.";
    if ([payload.dapAnA, payload.dapAnB, payload.dapAnC, payload.dapAnD].some((answer) => answer.length > 200)) {
      return "Mỗi đáp án không được vượt quá 200 ký tự.";
    }
    const duplicatedAnswerPair = findDuplicatedAnswerPair(payload);
    if (duplicatedAnswerPair) {
      return `Đáp án ${duplicatedAnswerPair[0]} và ${duplicatedAnswerPair[1]} không được trùng nhau.`;
    }

    return "";
  };

  const setFormDisabled = (disabled) => {
    questionBankForm
      .querySelectorAll("select, textarea, input[type='text'], input[type='radio']")
      .forEach((input) => {
        if (input.id !== "questionId") {
          input.disabled = disabled;
        }
      });
    questionBankForm.classList.toggle("form-locked", disabled);
  };

  const setLevel = (level) => {
    const input = questionBankForm.querySelector(`input[name='level'][value='${level || "B"}']`);
    if (input) input.checked = true;
  };

  const setButtonState = () => {
    const selectedQuestion = getSelectedQuestion();
    const canChangeSelected = canMutate && selectedQuestion && !selectedQuestion.daSuDung;
    const editing = isEditing();

    const buttonStates = [
      [elements.btnAdd, !canMutate || editing],
      [elements.btnEdit, !canChangeSelected || editing],
      [elements.btnDelete, !canChangeSelected || editing],
      [elements.btnUndo, !editing],
      [elements.btnExitMode, !editing],
      [elements.btnSave, !editing],
    ];

    buttonStates.forEach(([button, locked]) => {
      button.disabled = false;
      button.classList.toggle("disabled", locked);
      button.setAttribute("aria-disabled", locked ? "true" : "false");
    });
  };

  const getLockedActionMessage = (action) => {
    const selectedQuestion = getSelectedQuestion();

    if (!canMutate && ["add", "edit", "delete", "save"].includes(action)) {
      return "PGV chỉ được xem danh sách câu hỏi, không được thêm, sửa hoặc xóa.";
    }

    if (action === "add") {
      if (isEditing()) return "Đang thao tác, hãy Ghi hoặc Thoát trước khi thêm câu hỏi mới.";
      return "";
    }

    if (action === "edit") {
      if (isEditing()) return "Đang thao tác, hãy Ghi hoặc Thoát trước khi hiệu chỉnh câu hỏi khác.";
      if (!selectedQuestion) return "Vui lòng chọn câu hỏi cần hiệu chỉnh.";
      if (selectedQuestion.daSuDung) return "Câu hỏi đã phát sinh bài thi nên không được hiệu chỉnh.";
      return "";
    }

    if (action === "delete") {
      if (isEditing()) return "Đang thao tác, hãy Ghi hoặc Thoát trước khi xóa câu hỏi.";
      if (!selectedQuestion) return "Vui lòng chọn câu hỏi cần xóa.";
      if (selectedQuestion.daSuDung) return "Câu hỏi đã phát sinh bài thi nên không được xóa.";
      return "";
    }

    if (action === "undo") {
      return isEditing() ? "" : "Chưa có thao tác thêm hoặc hiệu chỉnh nào để phục hồi.";
    }

    if (action === "exit") {
      return isEditing() ? "" : "Hiện không có thao tác thêm hoặc hiệu chỉnh nào để thoát.";
    }

    if (action === "save") {
      return isEditing() ? "" : "Vui lòng chọn chức năng Thêm hoặc Hiệu chỉnh trước khi ghi.";
    }

    return "";
  };

  const showLockedActionMessage = (action) => {
    const message = getLockedActionMessage(action);

    if (!message) return false;
    setMessage(message, "warning");
    return true;
  };

  const getLockedFormMessage = () => {
    const selectedQuestion = getSelectedQuestion();

    if (!canMutate) {
      return "PGV chỉ được xem danh sách câu hỏi, không được nhập hoặc hiệu chỉnh.";
    }

    if (!selectedQuestion) {
      return "Vui lòng bấm Thêm để nhập câu hỏi mới, hoặc chọn một câu hỏi rồi bấm Hiệu chỉnh.";
    }

    if (selectedQuestion.daSuDung) {
      return "Câu hỏi đã phát sinh bài thi nên chỉ được xem, không được hiệu chỉnh.";
    }

    return "Bấm Hiệu chỉnh để sửa câu hỏi đã chọn, hoặc bấm Thêm để nhập câu hỏi mới.";
  };

  const clearForm = () => {
    questionBankForm.reset();
    elements.questionId.value = "";
    setLevel("B");
    setSelectedAnswer("A");
  };

  const fillForm = (question) => {
    elements.questionId.value = question?.cauHoi || "";
    elements.subject.value = question?.maMonHoc || "";
    setLevel(question?.trinhDo || "B");
    elements.content.value = question?.noiDung || "";
    elements.answerA.value = question?.dapAnA || "";
    elements.answerB.value = question?.dapAnB || "";
    elements.answerC.value = question?.dapAnC || "";
    elements.answerD.value = question?.dapAnD || "";
    setSelectedAnswer(question?.dapAnDung || "A");
  };

  const setMode = (mode) => {
    state.mode = mode;
    setFormDisabled(mode === "view");
    questionBankForm.dataset.mode = mode;
    setModeBadge(mode);
    setButtonState();
  };

  const getFilterSubjectLabel = () => {
    const option = elements.filterSubject?.selectedOptions?.[0];
    return option && option.value ? option.textContent.trim() : "";
  };

  const updateFilterSummary = () => {
    if (!elements.filterSummary) return;

    const filters = [];
    const keyword = elements.keyword.value.trim();
    const subjectLabel = getFilterSubjectLabel();
    const level = elements.filterLevel.value;

    if (subjectLabel) filters.push(`Môn học: ${subjectLabel}`);
    if (level) filters.push(`Trình độ: ${level}`);
    if (keyword) filters.push(`Từ khóa: "${keyword}"`);

    elements.filterSummary.querySelector("span:last-child").textContent =
      filters.length > 0 ? `Đang lọc theo ${filters.join(" | ")}` : "Chưa áp dụng bộ lọc";
  };

  const getVisibleQuestions = () => state.questions;

  const renderRows = () => {
    const questions = getVisibleQuestions();
    const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const startIndex = (state.currentPage - 1) * pageSize;
    const visibleQuestions = questions.slice(startIndex, startIndex + pageSize);

    if (visibleQuestions.length === 0) {
      elements.tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;
    } else {
      elements.tableBody.innerHTML = visibleQuestions
        .map(
          (question) => `
            <tr data-question-id="${question.cauHoi}" tabindex="0" title="Nhấn để chọn câu hỏi" aria-selected="${question.cauHoi === state.selectedQuestionId}" class="${question.cauHoi === state.selectedQuestionId ? "selected" : ""}">
              <td class="text-left">${question.cauHoi}</td>
              <td class="text-left">${escapeHtml(question.tenMonHoc || question.maMonHoc)}</td>
              <td class="text-left">${escapeHtml(question.trinhDo)}</td>
              <td class="text-left question-content-cell">${escapeHtml(question.noiDung)}</td>
              <td class="text-left">${escapeHtml(question.dapAnDung)}</td>
              <td class="text-left">
                <span class="status-badge ${question.daSuDung ? "locked" : "open"}">
                  ${question.daSuDung ? "Đã dùng" : "Có thể sửa"}
                </span>
              </td>
            </tr>
          `,
        )
        .join("");
    }

    elements.paginationText.textContent = `Hiển thị ${visibleQuestions.length} / ${questions.length} câu hỏi`;
    elements.btnPrevPage.disabled = state.currentPage <= 1;
    elements.btnNextPage.disabled = state.currentPage >= totalPages;
    elements.pageList.textContent = `${state.currentPage} / ${totalPages}`;
    setButtonState();
  };

  const loadQuestions = async () => {
    setModeBadge("search");
    const keyword = elements.keyword.value.trim();
    const params = [];

    if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
    if (elements.filterSubject.value) params.push(`maMonHoc=${encodeURIComponent(elements.filterSubject.value)}`);
    if (elements.filterLevel.value) params.push(`trinhDo=${encodeURIComponent(elements.filterLevel.value)}`);

    const query = params.join("&");
    const result = await requestJson(`/lecturer/question-bank/questions${query ? `?${query}` : ""}`);
    state.questions = result.data;
    state.currentPage = 1;
    state.selectedQuestionId = null;
    clearForm();
    setMode("view");
    updateFilterSummary();
    renderRows();
  };

  const loadSubjects = async () => {
    const result = await requestJson("/lecturer/question-bank/subjects");
    elements.subject.innerHTML = `<option value="">Chọn môn học</option>`;
    elements.filterSubject.innerHTML = `<option value="">Tất cả môn học</option>`;
    result.data.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.maMonHoc;
      option.textContent = `${subject.maMonHoc} - ${subject.tenMonHoc}`;
      elements.subject.appendChild(option);

      const filterOption = option.cloneNode(true);
      elements.filterSubject.appendChild(filterOption);
    });
  };

  const selectQuestion = (questionId) => {
    const question = state.questions.find((item) => item.cauHoi === Number(questionId));
    if (!question) return;

    state.selectedQuestionId = question.cauHoi;
    fillForm(question);
    setMode("view");
    setMessage(
      question.daSuDung ? "Câu hỏi đã phát sinh bài thi nên chỉ được xem." : "Đã chọn câu hỏi.",
      question.daSuDung ? "warning" : "info",
    );
    renderRows();
  };

  elements.tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-question-id]");
    if (row) selectQuestion(row.dataset.questionId);
  });

  elements.tableBody.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("tr[data-question-id]");
    if (!row) return;
    event.preventDefault();
    selectQuestion(row.dataset.questionId);
  });

  elements.formBody.addEventListener("pointerdown", (event) => {
    if (!questionBankForm.classList.contains("form-locked")) return;

    event.preventDefault();
    setMessage(getLockedFormMessage(), "warning");
  });

  elements.btnAdd.addEventListener("click", () => {
    if (showLockedActionMessage("add")) return;

    clearForm();
    state.selectedQuestionId = null;
    setMode("create");
    setMessage("Đang thêm câu hỏi mới.", "info");
  });

  elements.btnEdit.addEventListener("click", () => {
    if (showLockedActionMessage("edit")) return;

    setMode("edit");
    setMessage("Đang hiệu chỉnh câu hỏi đã chọn.", "info");
  });

  elements.btnUndo.addEventListener("click", () => {
    if (showLockedActionMessage("undo")) return;

    const question = getSelectedQuestion();
    if (state.mode === "create") {
      clearForm();
      setMode("create");
      setMessage("Đã xóa dữ liệu đang nhập.", "info");
      return;
    }

    if (state.mode === "edit" && question) {
      fillForm(question);
      setMode("edit");
      setMessage("Đã phục hồi dữ liệu ban đầu của câu hỏi.", "info");
      return;
    }

    clearForm();
    setMode("view");
    setMessage("Đã xóa dữ liệu đang nhập.", "info");
  });

  elements.btnExitMode.addEventListener("click", () => {
    if (showLockedActionMessage("exit")) return;

    const question = getSelectedQuestion();
    if (question) fillForm(question);
    else clearForm();
    setMode("view");
    setMessage("Đã thoát thao tác hiện tại.", "info");
  });

  elements.btnSave.addEventListener("click", async () => {
    if (showLockedActionMessage("save")) return;

    const payload = getPayload();
    const validationMessage = validatePayload(payload);
    if (validationMessage) {
      setMessage(validationMessage, "error");
      return;
    }

    try {
      if (state.mode === "create") {
        await requestJson("/lecturer/question-bank/questions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Thêm câu hỏi thành công.", "success");
      } else if (state.mode === "edit" && state.selectedQuestionId) {
        await requestJson(`/lecturer/question-bank/questions/${state.selectedQuestionId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Sửa câu hỏi thành công.", "success");
      }

      await loadQuestions();
    } catch (error) {
      setMessage(error.message, "error");
    }
  });

  elements.btnDelete.addEventListener("click", async () => {
    if (showLockedActionMessage("delete")) return;

    const confirmed = window.confirm("Xóa câu hỏi đã chọn?");
    if (!confirmed) return;

    try {
      await requestJson(`/lecturer/question-bank/questions/${state.selectedQuestionId}`, {
        method: "DELETE",
      });
      setMessage("Xóa câu hỏi thành công.", "success");
      await loadQuestions();
    } catch (error) {
      setMessage(error.message, "error");
      setModeBadge(state.mode);
    }
  });

  elements.btnKeywordSearch.addEventListener("click", () => {
    loadQuestions().catch((error) => {
      setMessage(error.message, "error");
      setModeBadge(state.mode);
    });
  });

  elements.keyword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadQuestions().catch((error) => setMessage(error.message, "error"));
    }
  });

  elements.keyword.addEventListener("input", updateFilterSummary);

  elements.btnToggleFilters.addEventListener("click", () => {
    elements.filterPanel.hidden = !elements.filterPanel.hidden;
  });

  elements.filterSubject.addEventListener("change", updateFilterSummary);

  elements.filterLevel.addEventListener("change", updateFilterSummary);

  elements.btnApplyFilters.addEventListener("click", () => {
    loadQuestions().catch((error) => {
      setMessage(error.message, "error");
      setModeBadge(state.mode);
    });
  });

  elements.btnClearFilters.addEventListener("click", () => {
    elements.filterSubject.value = "";
    elements.filterLevel.value = "";
    elements.keyword.value = "";
    updateFilterSummary();
    loadQuestions().catch((error) => {
      setMessage(error.message, "error");
      setModeBadge(state.mode);
    });
  });

  questionBankForm.querySelectorAll(".level-item").forEach((item) => {
    item.addEventListener("click", () => {
      const input = item.querySelector("input[name='level']");
      if (input && !input.disabled) input.checked = true;
    });
  });

  questionBankForm.querySelectorAll(".answer-wrap").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (event.target.matches("input[type='text']")) return;
      const input = item.querySelector("input[name='correctAnswer']");
      if (input && !input.disabled) input.checked = true;
    });
  });

  elements.btnPrevPage.addEventListener("click", () => {
    state.currentPage = Math.max(1, state.currentPage - 1);
    renderRows();
  });

  elements.btnNextPage.addEventListener("click", () => {
    state.currentPage += 1;
    renderRows();
  });

  if (!canMutate) {
    setMessage("PGV chỉ được xem danh sách câu hỏi trong module 4.5.", "warning");
  }

  setFormDisabled(true);
  setButtonState();
  updateFilterSummary();
  Promise.all([loadSubjects(), loadQuestions()]).catch((error) => setMessage(error.message, "error"));
}
