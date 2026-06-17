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
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnSave: document.querySelector("#btnSave"),
    btnSearch: document.querySelector("#btnSearch"),
    btnPrevPage: document.querySelector("#btnPrevPage"),
    btnNextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
  };

  const canMutate = questionBankForm.dataset.canMutate === "true";
  const pageSize = 10;
  const state = {
    mode: "view",
    questions: [],
    selectedQuestionId: null,
    currentPage: 1,
  };

  const setMessage = (message, type = "info") => {
    if (!elements.message) return;
    elements.message.textContent = message || "";
    elements.message.dataset.type = type;
    elements.message.classList.toggle("active", Boolean(message));
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
  };

  const setButtonState = () => {
    const selectedQuestion = state.questions.find((question) => question.cauHoi === state.selectedQuestionId);
    const canChangeSelected = canMutate && selectedQuestion && !selectedQuestion.daSuDung;
    const editing = state.mode === "create" || state.mode === "edit";

    elements.btnAdd.disabled = !canMutate || editing;
    elements.btnEdit.disabled = !canChangeSelected || editing;
    elements.btnDelete.disabled = !canChangeSelected || editing;
    elements.btnUndo.disabled = !editing;
    elements.btnSave.disabled = !editing;

    [elements.btnAdd, elements.btnEdit, elements.btnDelete, elements.btnUndo, elements.btnSave].forEach((button) => {
      button.classList.toggle("disabled", button.disabled);
    });
  };

  const clearForm = () => {
    questionBankForm.reset();
    elements.questionId.value = "";
    setSelectedAnswer("A");
  };

  const fillForm = (question) => {
    elements.questionId.value = question?.cauHoi || "";
    elements.subject.value = question?.maMonHoc || "";
    questionBankForm.querySelector(`input[name='level'][value='${question?.trinhDo || "A"}']`).checked = true;
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
    setButtonState();
  };

  const getVisibleQuestions = () => state.questions;

  const renderRows = () => {
    const questions = getVisibleQuestions();
    const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const startIndex = (state.currentPage - 1) * pageSize;
    const visibleQuestions = questions.slice(startIndex, startIndex + pageSize);

    if (visibleQuestions.length === 0) {
      elements.tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>`;
    } else {
      elements.tableBody.innerHTML = visibleQuestions
        .map(
          (question) => `
            <tr data-question-id="${question.cauHoi}" class="${question.cauHoi === state.selectedQuestionId ? "selected" : ""}">
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
              <td class="text-right">
                <button class="table-action" type="button" data-action="select" data-question-id="${question.cauHoi}">
                  Chọn
                </button>
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
    const keyword = elements.keyword.value.trim();
    const query = keyword ? `keyword=${encodeURIComponent(keyword)}` : "";
    const result = await requestJson(`/lecturer/question-bank/questions${query ? `?${query}` : ""}`);
    state.questions = result.data;
    state.currentPage = 1;
    state.selectedQuestionId = null;
    clearForm();
    setMode("view");
    renderRows();
  };

  const loadSubjects = async () => {
    const result = await requestJson("/lecturer/question-bank/subjects");
    elements.subject.innerHTML = `<option value="">Chọn môn học</option>`;
    result.data.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.maMonHoc;
      option.textContent = `${subject.maMonHoc} - ${subject.tenMonHoc}`;
      elements.subject.appendChild(option);
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
    const button = event.target.closest("[data-question-id]");
    if (button) selectQuestion(button.dataset.questionId);
  });

  elements.btnAdd.addEventListener("click", () => {
    clearForm();
    state.selectedQuestionId = null;
    setMode("create");
    setMessage("Đang thêm câu hỏi mới.", "info");
  });

  elements.btnEdit.addEventListener("click", () => {
    if (!state.selectedQuestionId) return;
    setMode("edit");
    setMessage("Đang hiệu chỉnh câu hỏi đã chọn.", "info");
  });

  elements.btnUndo.addEventListener("click", () => {
    const question = state.questions.find((item) => item.cauHoi === state.selectedQuestionId);
    if (question) fillForm(question);
    else clearForm();
    setMode("view");
    setMessage("Đã hủy thao tác.", "info");
  });

  elements.btnSave.addEventListener("click", async () => {
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
    if (!state.selectedQuestionId) return;
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
    }
  });

  elements.btnSearch.addEventListener("click", () => {
    loadQuestions().catch((error) => setMessage(error.message, "error"));
  });

  elements.keyword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadQuestions().catch((error) => setMessage(error.message, "error"));
    }
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
  Promise.all([loadSubjects(), loadQuestions()]).catch((error) => setMessage(error.message, "error"));
}
