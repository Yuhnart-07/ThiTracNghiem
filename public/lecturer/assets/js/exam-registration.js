const registrationForm = document.querySelector("#examRegistrationForm");

if (registrationForm) {
  const elements = {
    message: document.querySelector("#examRegistrationMessage"),
    availability: document.querySelector("#questionAvailabilityStatus"),
    availabilityIcon: document.querySelector("#availabilityIcon"),
    availabilityText: document.querySelector("#availabilityText"),
    classSelect: document.querySelector("#classSelect"),
    subject: document.querySelector("#subjectSelect"),
    level: document.querySelector("#levelSelect"),
    attempt: document.querySelector("#attemptInput"),
    questionCount: document.querySelector("#questionCountInput"),
    examDate: document.querySelector("#examDateInput"),
    duration: document.querySelector("#durationInput"),
    oldSubject: document.querySelector("#originalSubject"),
    oldClass: document.querySelector("#originalClass"),
    oldAttempt: document.querySelector("#originalAttempt"),
    tableBody: document.querySelector("#recordsTableBody"),
    paginationText: document.querySelector(".inner-pagination-text"),
    modeBadge: document.querySelector("#modeBadge") || document.querySelector(".inner-badge"),
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnExitMode: document.querySelector("#btnExitMode"),
    btnSave: document.querySelector("#btnSave"),
    keyword: document.querySelector("#tableFilter"),
    btnKeywordSearch: document.querySelector("#btnKeywordSearch") || document.querySelector("#btnSearch"),
    btnToggleFilters: document.querySelector("#btnToggleFilters"),
    filterPanel: document.querySelector("#registrationFilterPanel"),
    filterClass: document.querySelector("#filterClass"),
    filterSubject: document.querySelector("#filterSubject"),
    filterLevel: document.querySelector("#filterLevel"),
    filterSummary: document.querySelector("#filterSummary"),
    btnApplyFilters: document.querySelector("#btnApplyFilters"),
    btnClearFilters: document.querySelector("#btnClearFilters"),
    btnPrevPage: document.querySelector("#btnPrevPage"),
    btnNextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
    formBody: registrationForm.querySelector(".inner-wrap"),
  };

  const apiBase = registrationForm.dataset.apiBase;
  const canMutate = registrationForm.dataset.canMutate === "true";
  const pageSize = 10;
  const state = {
    mode: "view",
    registrations: [],
    selectedKey: null,
    currentPage: 1,
    availability: "idle",
    availabilitySequence: 0,
  };
  let availabilityTimer;

  const modeLabels = { view: "ĐANG XEM", create: "ĐANG THÊM", edit: "ĐANG SỬA", search: "ĐANG TÌM" };
  const availabilityLabels = {
    idle: ["hourglass_empty", "Chọn môn học, trình độ và số câu để hệ thống tự kiểm tra."],
    checking: ["sync", "Đang kiểm tra số câu trong bộ đề..."],
    valid: ["check_circle", "Đủ câu hỏi để đăng ký thi."],
    invalid: ["error", "Không đủ câu hỏi để đăng ký thi."],
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...options,
    });
    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error(data.message || "Không thể xử lý yêu cầu.");
    return data;
  };

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[character]);

  const registrationKey = (item) => `${item.maMonHoc}|${item.maLop}|${item.lan}`;
  const isEditing = () => state.mode === "create" || state.mode === "edit";
  const getSelectedRegistration = () => state.registrations.find((item) => registrationKey(item) === state.selectedKey);

  const setMessage = (message, type = "info") => {
    elements.message.textContent = message || "";
    elements.message.dataset.type = type;
    elements.message.classList.toggle("active", Boolean(message));
  };

  const setAvailability = (availability, detail = "") => {
    state.availability = availability;
    const [icon, defaultText] = availabilityLabels[availability];
    elements.availability.dataset.state = availability;
    elements.availabilityIcon.textContent = icon;
    elements.availabilityText.textContent = detail || defaultText;
    setButtonState();
  };

  const setFormDisabled = (disabled) => {
    registrationForm.querySelectorAll("select, input[type='number'], input[type='datetime-local']").forEach((input) => {
      input.disabled = disabled;
    });
    registrationForm.classList.toggle("form-locked", disabled);
  };

  const setButtonLocked = (button, locked) => {
    if (!button) return;
    button.disabled = false;
    button.classList.toggle("disabled", locked);
    button.setAttribute("aria-disabled", locked ? "true" : "false");
  };

  function setButtonState() {
    const selected = getSelectedRegistration();
    const canChangeSelected = canMutate && selected && !selected.daKhoa;
    const editing = isEditing();
    setButtonLocked(elements.btnAdd, !canMutate || editing);
    setButtonLocked(elements.btnEdit, !canChangeSelected || editing);
    setButtonLocked(elements.btnDelete, !canChangeSelected || editing);
    setButtonLocked(elements.btnUndo, !editing);
    setButtonLocked(elements.btnExitMode, !editing);
    setButtonLocked(elements.btnSave, !editing || state.availability !== "valid");
  }

  const setMode = (mode) => {
    state.mode = mode;
    elements.modeBadge.textContent = modeLabels[mode] || modeLabels.view;
    setFormDisabled(!isEditing());
    if (!isEditing()) setAvailability("idle");
    setButtonState();
  };

  const formatDate = (value) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  const toDateInput = (value) => {
    const date = new Date(value);
    const pad = (part) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getPayload = () => ({
    maLop: elements.classSelect.value,
    maMonHoc: elements.subject.value,
    trinhDo: elements.level.value,
    lan: Number(elements.attempt.value),
    soCauThi: Number(elements.questionCount.value),
    ngayThi: elements.examDate.value,
    thoiGian: Number(elements.duration.value),
  });

  const validatePayload = (payload) => {
    if (!payload.maLop) return "Vui lòng chọn lớp.";
    if (!payload.maMonHoc) return "Vui lòng chọn môn học.";
    if (!["A", "B", "C"].includes(payload.trinhDo)) return "Trình độ chỉ được là A, B hoặc C.";
    if (!Number.isInteger(payload.lan) || payload.lan < 1 || payload.lan > 2) return "Lần thi phải là 1 hoặc 2.";
    if (!Number.isInteger(payload.soCauThi) || payload.soCauThi < 10 || payload.soCauThi > 100) return "Số câu thi phải từ 10 đến 100.";
    if (!payload.ngayThi || Number.isNaN(new Date(payload.ngayThi).getTime())) return "Ngày giờ thi không hợp lệ.";
    if (new Date(payload.ngayThi) <= new Date()) return "Ngày giờ thi phải nằm trong tương lai.";
    if (!Number.isInteger(payload.thoiGian) || payload.thoiGian < 5 || payload.thoiGian > 60) return "Thời gian thi phải từ 5 đến 60 phút.";
    return "";
  };

  const clearForm = () => {
    registrationForm.reset();
    elements.attempt.value = "1";
    elements.questionCount.value = "20";
    elements.duration.value = "30";
    elements.oldSubject.value = "";
    elements.oldClass.value = "";
    elements.oldAttempt.value = "";
    setAvailability("idle");
  };

  const fillForm = (item) => {
    elements.classSelect.value = item.maLop;
    elements.subject.value = item.maMonHoc;
    elements.level.value = item.trinhDo;
    elements.attempt.value = item.lan;
    elements.questionCount.value = item.soCauThi;
    elements.examDate.value = toDateInput(item.ngayThi);
    elements.duration.value = item.thoiGian;
    elements.oldSubject.value = item.maMonHoc;
    elements.oldClass.value = item.maLop;
    elements.oldAttempt.value = item.lan;
    setAvailability("idle");
  };

  const availabilityInputIsValid = () => {
    const count = Number(elements.questionCount.value);
    return Boolean(elements.subject.value) && ["A", "B", "C"].includes(elements.level.value) && Number.isInteger(count) && count >= 10 && count <= 100;
  };

  const checkQuestionAvailability = async (sequence) => {
    try {
      const result = await requestJson(`${apiBase}/check-questions`, {
        method: "POST",
        body: JSON.stringify({
          maMonHoc: elements.subject.value,
          trinhDo: elements.level.value,
          soCauThi: Number(elements.questionCount.value),
        }),
      });
      if (sequence !== state.availabilitySequence || !isEditing()) return;
      const data = result.data;
      const lowerDetail = data.TrinhDoThapHon ? `, ${data.SoCauThapHon} câu ${data.TrinhDoThapHon}` : "";
      const detail = `${data.ThongBao} Hiện có ${data.SoCauDungTrinhDo} câu ${data.TrinhDo}${lowerDetail}; cần tối thiểu ${data.SoCauToiThieuDungTrinhDo} câu đúng trình độ.`;
      setAvailability(data.DuCau ? "valid" : "invalid", detail);
    } catch (error) {
      if (sequence !== state.availabilitySequence || !isEditing()) return;
      setAvailability("invalid", error.message);
    }
  };

  const scheduleAvailabilityCheck = () => {
    window.clearTimeout(availabilityTimer);
    state.availabilitySequence += 1;
    const sequence = state.availabilitySequence;
    if (!isEditing() || !canMutate) {
      setAvailability("idle");
      return;
    }
    if (!availabilityInputIsValid()) {
      setAvailability("idle", "Chọn môn học, trình độ và nhập số câu từ 10 đến 100 để tự kiểm tra.");
      return;
    }
    setAvailability("checking");
    availabilityTimer = window.setTimeout(() => checkQuestionAvailability(sequence), 400);
  };

  const getFilterParams = () => {
    const params = new window.URLSearchParams();
    const keyword = elements.keyword.value.trim();
    if (keyword) params.set("keyword", keyword);
    if (elements.filterClass.value) params.set("maLop", elements.filterClass.value);
    if (elements.filterSubject.value) params.set("maMonHoc", elements.filterSubject.value);
    if (elements.filterLevel.value) params.set("trinhDo", elements.filterLevel.value);
    return params;
  };

  const updateFilterSummary = () => {
    const filters = [];
    if (elements.filterClass.value) filters.push(`Lớp: ${elements.filterClass.selectedOptions[0].textContent}`);
    if (elements.filterSubject.value) filters.push(`Môn: ${elements.filterSubject.selectedOptions[0].textContent}`);
    if (elements.filterLevel.value) filters.push(`Trình độ: ${elements.filterLevel.value}`);
    if (elements.keyword.value.trim()) filters.push(`Từ khóa: "${elements.keyword.value.trim()}"`);
    elements.filterSummary.querySelector("span:last-child").textContent = filters.length ? `Đang lọc theo ${filters.join(" | ")}` : "Chưa áp dụng bộ lọc";
  };

  const renderRows = () => {
    const totalPages = Math.max(1, Math.ceil(state.registrations.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = state.registrations.slice(start, start + pageSize);
    elements.tableBody.innerHTML = visible.length ? visible.map((item) => `
      <tr data-registration-key="${escapeHtml(registrationKey(item))}" class="${registrationKey(item) === state.selectedKey ? "selected" : ""}">
        <td>${escapeHtml(item.tenLop)}</td><td>${escapeHtml(item.tenMonHoc)}</td><td>${item.trinhDo}</td>
        <td>${item.lan}</td><td>${item.soCauThi}</td><td>${formatDate(item.ngayThi)}</td><td>${item.thoiGian}</td>
        <td><span class="status-badge ${item.daKhoa ? "locked" : "open"}">${item.daKhoa ? "Đã khóa" : "Có thể sửa"}</span></td>
        <td>${escapeHtml(item.hoTenGiangVien)}</td>
      </tr>`).join("") : '<tr><td colspan="9" class="text-center">Không có dữ liệu</td></tr>';
    elements.paginationText.textContent = `Hiển thị ${visible.length} / ${state.registrations.length} đăng ký`;
    elements.btnPrevPage.disabled = state.currentPage <= 1;
    elements.btnNextPage.disabled = state.currentPage >= totalPages;
    elements.pageList.textContent = `${state.currentPage} / ${totalPages}`;
    setButtonState();
  };

  const loadRegistrations = async () => {
    const query = getFilterParams().toString();
    const result = await requestJson(`${apiBase}/registrations${query ? `?${query}` : ""}`);
    state.registrations = result.data;
    state.selectedKey = null;
    state.currentPage = 1;
    clearForm();
    setMode("view");
    updateFilterSummary();
    renderRows();
  };

  const selectRegistration = (key) => {
    const item = state.registrations.find((registration) => registrationKey(registration) === key);
    if (!item) return;
    state.selectedKey = key;
    fillForm(item);
    setMode("view");
    setMessage(item.daKhoa ? "Đăng ký đã phát sinh bài thi hoặc điểm nên chỉ được xem." : "Đã chọn đăng ký thi.", item.daKhoa ? "warning" : "info");
    renderRows();
  };

  const lockedActionMessage = (action) => {
    const selected = getSelectedRegistration();
    if (!canMutate && ["add", "edit", "delete", "save"].includes(action)) return "PGV chỉ được xem danh sách đăng ký thi.";
    if (action === "add" && isEditing()) return "Đang thao tác, hãy Ghi hoặc Thoát trước khi thêm mới.";
    if (action === "edit" && (!selected || selected.daKhoa || isEditing())) return !selected ? "Vui lòng chọn đăng ký cần hiệu chỉnh." : selected.daKhoa ? "Đăng ký đã bị khóa nên không được hiệu chỉnh." : "Hãy hoàn tất thao tác hiện tại trước.";
    if (action === "delete" && (!selected || selected.daKhoa || isEditing())) return !selected ? "Vui lòng chọn đăng ký cần xóa." : selected.daKhoa ? "Đăng ký đã bị khóa nên không được xóa." : "Hãy hoàn tất thao tác hiện tại trước.";
    if (["undo", "exit"].includes(action) && !isEditing()) return "Chưa có thao tác thêm hoặc hiệu chỉnh.";
    if (action === "save") {
      if (!isEditing()) return "Vui lòng chọn Thêm hoặc Hiệu chỉnh trước khi ghi.";
      if (state.availability === "checking") return "Hệ thống đang kiểm tra số câu, vui lòng chờ.";
      if (state.availability !== "valid") return "Chưa xác nhận đủ câu hỏi nên chưa thể ghi.";
    }
    return "";
  };

  const guardAction = (action) => {
    const message = lockedActionMessage(action);
    if (!message) return false;
    setMessage(message, "warning");
    return true;
  };

  elements.tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-registration-key]");
    if (row) selectRegistration(row.dataset.registrationKey);
  });

  elements.formBody.addEventListener("pointerdown", (event) => {
    if (!registrationForm.classList.contains("form-locked")) return;
    event.preventDefault();
    setMessage(canMutate ? "Chọn Thêm hoặc Hiệu chỉnh trước khi nhập dữ liệu." : "PGV chỉ được xem danh sách đăng ký thi.", "warning");
  });

  elements.btnAdd?.addEventListener("click", () => {
    if (guardAction("add")) return;
    state.selectedKey = null;
    clearForm();
    setMode("create");
    setMessage("Đang thêm đăng ký thi mới. Hệ thống sẽ tự kiểm tra số câu.", "info");
    scheduleAvailabilityCheck();
    renderRows();
  });

  elements.btnEdit?.addEventListener("click", () => {
    if (guardAction("edit")) return;
    setMode("edit");
    setMessage("Đang hiệu chỉnh đăng ký thi đã chọn.", "info");
    scheduleAvailabilityCheck();
  });

  elements.btnUndo?.addEventListener("click", () => {
    if (guardAction("undo")) return;
    const selected = getSelectedRegistration();
    if (state.mode === "edit" && selected) fillForm(selected); else clearForm();
    scheduleAvailabilityCheck();
    setMessage(state.mode === "edit" ? "Đã phục hồi dữ liệu đăng ký ban đầu." : "Đã xóa dữ liệu đang nhập.", "info");
  });

  elements.btnExitMode?.addEventListener("click", () => {
    if (guardAction("exit")) return;
    const selected = getSelectedRegistration();
    if (selected) fillForm(selected); else clearForm();
    setMode("view");
    setMessage("Đã thoát thao tác hiện tại.", "info");
  });

  elements.btnSave?.addEventListener("click", async () => {
    if (guardAction("save")) return;
    const payload = getPayload();
    const validationMessage = validatePayload(payload);
    if (validationMessage) { setMessage(validationMessage, "error"); return; }
    try {
      const editing = state.mode === "edit";
      const url = editing ? `${apiBase}/registrations/${encodeURIComponent(elements.oldSubject.value)}/${encodeURIComponent(elements.oldClass.value)}/${elements.oldAttempt.value}` : `${apiBase}/registrations`;
      const result = await requestJson(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      await loadRegistrations();
      setMessage(result.message, "success");
    } catch (error) { setMessage(error.message, "error"); }
  });

  elements.btnDelete?.addEventListener("click", async () => {
    if (guardAction("delete")) return;
    if (!window.confirm("Xóa đăng ký thi đã chọn?")) return;
    const selected = getSelectedRegistration();
    try {
      const result = await requestJson(`${apiBase}/registrations/${encodeURIComponent(selected.maMonHoc)}/${encodeURIComponent(selected.maLop)}/${selected.lan}`, { method: "DELETE" });
      await loadRegistrations();
      setMessage(result.message, "success");
    } catch (error) { setMessage(error.message, "error"); }
  });

  [elements.subject, elements.level].forEach((input) => input.addEventListener("change", scheduleAvailabilityCheck));
  elements.questionCount.addEventListener("input", scheduleAvailabilityCheck);
  elements.keyword.addEventListener("input", updateFilterSummary);
  elements.keyword.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); loadRegistrations().catch((error) => setMessage(error.message, "error")); } });
  elements.btnKeywordSearch?.addEventListener("click", () => loadRegistrations().catch((error) => setMessage(error.message, "error")));
  elements.btnToggleFilters?.addEventListener("click", () => { elements.filterPanel.hidden = !elements.filterPanel.hidden; });
  [elements.filterClass, elements.filterSubject, elements.filterLevel].forEach((input) => input.addEventListener("change", updateFilterSummary));
  elements.btnApplyFilters.addEventListener("click", () => loadRegistrations().catch((error) => setMessage(error.message, "error")));
  elements.btnClearFilters.addEventListener("click", () => { elements.filterClass.value = ""; elements.filterSubject.value = ""; elements.filterLevel.value = ""; elements.keyword.value = ""; loadRegistrations().catch((error) => setMessage(error.message, "error")); });
  elements.btnPrevPage.addEventListener("click", () => { state.currentPage = Math.max(1, state.currentPage - 1); renderRows(); });
  elements.btnNextPage.addEventListener("click", () => { state.currentPage += 1; renderRows(); });

  setMode("view");
  if (!canMutate) setMessage("PGV chỉ được xem toàn bộ danh sách đăng ký thi.", "warning");
  loadRegistrations().catch((error) => setMessage(error.message, "error"));
}
