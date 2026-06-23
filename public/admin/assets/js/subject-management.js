(function () {
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/admin/subject-management";
  const pageSize = 10;

  const state = {
    mode: "view", // view, create, edit
    list: [],
    selectedKey: null, // maMonHoc
    checkedKeys: [], // danh sách các maMonHoc được check chọn xóa
    currentPage: 1,
    filterKeyword: "",
  };

  const form = document.querySelector("#subjectForm");
  const inputs = {
    code: document.querySelector("#subjectCode"),
    name: document.querySelector("#subjectName"),
  };

  const buttons = {
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnSave: document.querySelector("#btnSave"),
    btnSearch: document.querySelector("#btnSearch"),
    prevPage: document.querySelector("#btnPrevPage"),
    nextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
    paginationText: document.querySelector("#paginationText"),
    tableBody: document.querySelector("#recordsTableBody"),
    filter: document.querySelector("#tableFilter"),
    modeBadge: document.querySelector(".inner-badge"),
    checkAll: document.querySelector("#checkAllSubjects"),
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...options,
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Không thể xử lý yêu cầu.");
    }
    return data;
  };

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[char]);

  const setFormDisabled = (disabled) => {
    inputs.code.disabled = disabled || state.mode === "edit";
    inputs.name.disabled = disabled;
    form.classList.toggle("form-locked", disabled);
  };

  const setButtonState = () => {
    const checkedCount = state.checkedKeys.length;
    const editing = state.mode === "create" || state.mode === "edit";

    buttons.btnAdd.disabled = editing;
    buttons.btnAdd.classList.toggle("disabled", editing);

    buttons.btnEdit.disabled = checkedCount !== 1 || editing;
    buttons.btnEdit.classList.toggle("disabled", checkedCount !== 1 || editing);

    buttons.btnDelete.disabled = checkedCount === 0 || editing;
    buttons.btnDelete.classList.toggle("disabled", checkedCount === 0 || editing);

    buttons.btnUndo.disabled = !editing;
    buttons.btnUndo.classList.toggle("disabled", !editing);

    buttons.btnSave.disabled = !editing;
    buttons.btnSave.classList.toggle("disabled", !editing);
  };

  const setMode = (mode) => {
    state.mode = mode;
    const labels = { view: "VIEW MODE", create: "CREATE MODE", edit: "EDIT MODE" };
    buttons.modeBadge.textContent = labels[mode] || "VIEW MODE";
    setFormDisabled(mode === "view");
    setButtonState();
  };

  const renderRows = () => {
    let filtered = state.list;
    if (state.filterKeyword) {
      const kw = state.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (sub) => sub.maMonHoc.toLowerCase().includes(kw) || sub.tenMonHoc.toLowerCase().includes(kw)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    if (buttons.checkAll) {
      const allVisibleChecked = visible.length > 0 && visible.every(item => state.checkedKeys.includes(item.maMonHoc));
      buttons.checkAll.checked = allVisibleChecked;
    }

    buttons.tableBody.innerHTML = visible.length
      ? visible
          .map((item) => {
            const isChecked = state.checkedKeys.includes(item.maMonHoc);
            return `
            <tr data-subject-key="${escapeHtml(item.maMonHoc)}" class="${isChecked ? "selected" : ""}">
              <td>
                <div class="checkbox-wrapper-30">
                  <span class="checkbox">
                    <input type="checkbox" name="selectedSubjectCheckbox" class="subject-checkbox" value="${escapeHtml(item.maMonHoc)}" ${isChecked ? "checked" : ""} style="cursor:pointer;" />
                    <svg><use class="checkbox" xlink:href="#checkbox-30"></use></svg>
                  </span>
                </div>
              </td>
              <td>${escapeHtml(item.maMonHoc)}</td>
              <td>${escapeHtml(item.tenMonHoc)}</td>
              <td class="text-right">
                <button class="inner-button select-subject-btn" data-subject-key="${escapeHtml(item.maMonHoc)}" style="padding: 4px 8px; font-size: 0.8rem; background: #3182ce; color: #fff;">
                  Chọn
                </button>
              </td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="4" class="text-center">Không có môn học nào</td></tr>';

    buttons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} môn học`;
    buttons.prevPage.disabled = state.currentPage <= 1;
    buttons.nextPage.disabled = state.currentPage >= totalPages;
    buttons.pageList.textContent = `${state.currentPage} / ${totalPages}`;
    setButtonState();
  };

  const loadSubjects = async () => {
    try {
      const res = await requestJson(`${apiBase}/subjects`);
      state.list = res.data;
      renderRows();
    } catch (e) {
      notify.error(e.message);
    }
  };

  const updateSelection = () => {
    const checkedCount = state.checkedKeys.length;
    if (checkedCount === 1) {
      state.selectedKey = state.checkedKeys[0];
      const item = state.list.find((sub) => sub.maMonHoc === state.selectedKey);
      if (item) {
        inputs.code.value = item.maMonHoc;
        inputs.name.value = item.tenMonHoc;
      }
    } else {
      state.selectedKey = null;
      inputs.code.value = "";
      inputs.name.value = "";
    }
    setButtonState();
  };

  const selectSubject = (maMonHoc) => {
    state.selectedKey = maMonHoc;
    state.checkedKeys = [maMonHoc];
    const item = state.list.find((sub) => sub.maMonHoc === maMonHoc);
    if (item) {
      inputs.code.value = item.maMonHoc;
      inputs.name.value = item.tenMonHoc;
    }
    setMode("view");
    renderRows();
  };

  // Event Listeners
  buttons.tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-subject-key]");
    if (!row) return;
    const maMonHoc = row.dataset.subjectKey;

    const selectBtn = e.target.closest(".select-subject-btn");
    const checkbox = e.target.closest(".subject-checkbox");

    if (selectBtn) {
      e.stopPropagation();
      selectSubject(maMonHoc);
    } else if (!checkbox) {
      selectSubject(maMonHoc);
    }
  });

  document.querySelector(".section-3").addEventListener("change", (e) => {
    if (e.target.id === "checkAllSubjects") {
      let filtered = state.list;
      if (state.filterKeyword) {
        const kw = state.filterKeyword.toLowerCase();
        filtered = filtered.filter(
          (sub) => sub.maMonHoc.toLowerCase().includes(kw) || sub.tenMonHoc.toLowerCase().includes(kw)
        );
      }
      const start = (state.currentPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);

      if (e.target.checked) {
        visible.forEach(item => {
          if (!state.checkedKeys.includes(item.maMonHoc)) {
            state.checkedKeys.push(item.maMonHoc);
          }
        });
      } else {
        visible.forEach(item => {
          const idx = state.checkedKeys.indexOf(item.maMonHoc);
          if (idx !== -1) state.checkedKeys.splice(idx, 1);
        });
      }
      updateSelection();
      renderRows();
    }

    if (e.target.classList.contains("subject-checkbox")) {
      const maMonHoc = e.target.value;
      if (e.target.checked) {
        if (!state.checkedKeys.includes(maMonHoc)) {
          state.checkedKeys.push(maMonHoc);
        }
      } else {
        const idx = state.checkedKeys.indexOf(maMonHoc);
        if (idx !== -1) state.checkedKeys.splice(idx, 1);
      }
      updateSelection();
      renderRows();
    }
  });

  buttons.btnAdd.addEventListener("click", () => {
    state.checkedKeys = [];
    state.selectedKey = null;
    inputs.code.value = "";
    inputs.name.value = "";
    setMode("create");
    inputs.code.focus();
  });

  buttons.btnEdit.addEventListener("click", () => {
    if (!state.selectedKey) return;
    setMode("edit");
    inputs.name.focus();
  });

  buttons.btnUndo.addEventListener("click", () => {
    setMode("view");
    if (state.selectedKey) {
      selectSubject(state.selectedKey);
    } else {
      inputs.code.value = "";
      inputs.name.value = "";
    }
  });

  buttons.btnSave.addEventListener("click", async () => {
    const payload = {
      maMonHoc: inputs.code.value.trim(),
      tenMonHoc: inputs.name.value.trim(),
    };

    if (!payload.maMonHoc || !payload.tenMonHoc) {
      notify.error("Vui lòng nhập đầy đủ Mã môn học và Tên môn học.");
      return;
    }

    try {
      if (state.mode === "create") {
        const res = await requestJson(`${apiBase}/subjects`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
        state.selectedKey = payload.maMonHoc;
        state.checkedKeys = [payload.maMonHoc];
      } else if (state.mode === "edit") {
        const res = await requestJson(`${apiBase}/subjects/${encodeURIComponent(state.selectedKey)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
      }
      setMode("view");
      await loadSubjects();
      if (state.selectedKey) {
        selectSubject(state.selectedKey);
      }
    } catch (e) {
      notify.error(e.message);
    }
  });

  buttons.btnDelete.addEventListener("click", async () => {
    const checkedCount = state.checkedKeys.length;
    if (checkedCount === 0) return;

    const confirmMessage = checkedCount === 1
      ? `Bạn có chắc chắn muốn xóa môn học ${state.checkedKeys[0]} không?`
      : `Bạn có chắc chắn muốn xóa ${checkedCount} môn học đã chọn không?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (checkedCount === 1) {
        const res = await requestJson(`${apiBase}/subjects/${encodeURIComponent(state.checkedKeys[0])}`, {
          method: "DELETE",
        });
        notify.success(res.message);
      } else {
        const idsString = state.checkedKeys.join(",");
        const res = await requestJson(`${apiBase}/subjects`, {
          method: "DELETE",
          body: JSON.stringify({ ids: idsString }),
        });
        notify.success(res.message);
      }
      state.checkedKeys = [];
      state.selectedKey = null;
      inputs.code.value = "";
      inputs.name.value = "";
      await loadSubjects();
    } catch (e) {
      notify.error(e.message);
    }
  });

  buttons.filter.addEventListener("input", (e) => {
    state.filterKeyword = e.target.value;
    state.currentPage = 1;
    renderRows();
  });

  buttons.prevPage.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderRows();
    }
  });

  buttons.nextPage.addEventListener("click", () => {
    const totalPages = Math.ceil(state.list.length / pageSize);
    if (state.currentPage < totalPages) {
      state.currentPage++;
      renderRows();
    }
  });

  setMode("view");
  loadSubjects();

})();
