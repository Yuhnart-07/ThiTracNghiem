(function () {
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/admin/lecturer-management";
  const pageSize = 10;

  const state = {
    mode: "view", // view, create, edit
    list: [],
    selectedKey: null, // maGiangVien
    checkedKeys: [], // danh sách các maGiangVien được check chọn
    currentPage: 1,
    filterKeyword: "",
  };

  const form = document.querySelector("#lecturerForm");
  const inputs = {
    code: document.querySelector("#lecturerCode"),
    lastName: document.querySelector("#last-name"),
    firstName: document.querySelector("#first-name"),
    phone: document.querySelector("#phone"),
    address: document.querySelector("#address"),
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
    checkAll: document.querySelector("#checkAllLecturers"),
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
    inputs.lastName.disabled = disabled;
    inputs.firstName.disabled = disabled;
    inputs.phone.disabled = disabled;
    inputs.address.disabled = disabled;
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
    if (buttons.modeBadge) {
      buttons.modeBadge.textContent = labels[mode] || "VIEW MODE";
    }
    setFormDisabled(mode === "view");
    setButtonState();
  };

  const renderRows = () => {
    let filtered = state.list;
    if (state.filterKeyword) {
      const kw = state.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (lec) =>
          lec.maGiangVien.toLowerCase().includes(kw) ||
          lec.ho.toLowerCase().includes(kw) ||
          lec.ten.toLowerCase().includes(kw) ||
          (lec.diaChi && lec.diaChi.toLowerCase().includes(kw)) ||
          (lec.sdt && lec.sdt.toLowerCase().includes(kw))
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    if (buttons.checkAll) {
      const allVisibleChecked = visible.length > 0 && visible.every(item => state.checkedKeys.includes(item.maGiangVien));
      buttons.checkAll.checked = allVisibleChecked;
    }

    buttons.tableBody.innerHTML = visible.length
      ? visible
          .map((item) => {
            const isChecked = state.checkedKeys.includes(item.maGiangVien);
            return `
            <tr data-lecturer-key="${escapeHtml(item.maGiangVien)}" class="${isChecked ? "selected" : ""}">
              <td>
                <div class="checkbox-wrapper-30">
                  <span class="checkbox">
                    <input type="checkbox" name="selectedLecturerCheckbox" class="lecturer-checkbox" value="${escapeHtml(item.maGiangVien)}" ${isChecked ? "checked" : ""} style="cursor:pointer;" />
                    <svg><use class="checkbox" xlink:href="#checkbox-30"></use></svg>
                  </span>
                </div>
              </td>
              <td>${escapeHtml(item.maGiangVien)}</td>
              <td>${escapeHtml(item.ho)}</td>
              <td>${escapeHtml(item.ten)}</td>
              <td>${escapeHtml(item.sdt)}</td>
              <td>${escapeHtml(item.diaChi)}</td>
              <td class="text-right">
                <button class="inner-button select-lecturer-btn" data-lecturer-key="${escapeHtml(item.maGiangVien)}" style="padding: 4px 8px; font-size: 0.8rem; background: #3182ce; color: #fff;">
                  Chọn
                </button>
              </td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="7" class="text-center">Không có giảng viên nào</td></tr>';

    buttons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} giảng viên`;
    buttons.prevPage.disabled = state.currentPage <= 1;
    buttons.nextPage.disabled = state.currentPage >= totalPages;
    buttons.pageList.textContent = `${state.currentPage} / ${totalPages}`;
    setButtonState();
  };

  const loadLecturers = async () => {
    try {
      const res = await requestJson(`${apiBase}/lecturers`);
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
      const item = state.list.find((lec) => lec.maGiangVien === state.selectedKey);
      if (item) {
        inputs.code.value = item.maGiangVien;
        inputs.lastName.value = item.ho;
        inputs.firstName.value = item.ten;
        inputs.phone.value = item.sdt;
        inputs.address.value = item.diaChi;
      }
    } else {
      state.selectedKey = null;
      inputs.code.value = "";
      inputs.lastName.value = "";
      inputs.firstName.value = "";
      inputs.phone.value = "";
      inputs.address.value = "";
    }
    setButtonState();
  };

  const selectLecturer = (maGiangVien) => {
    state.selectedKey = maGiangVien;
    state.checkedKeys = [maGiangVien];
    const item = state.list.find((lec) => lec.maGiangVien === maGiangVien);
    if (item) {
      inputs.code.value = item.maGiangVien;
      inputs.lastName.value = item.ho;
      inputs.firstName.value = item.ten;
      inputs.phone.value = item.sdt;
      inputs.address.value = item.diaChi;
    }
    setMode("view");
    renderRows();
  };

  // Event Listeners
  buttons.tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-lecturer-key]");
    if (!row) return;
    const maGiangVien = row.dataset.lecturerKey;

    const selectBtn = e.target.closest(".select-lecturer-btn");
    const checkbox = e.target.closest(".lecturer-checkbox");

    if (selectBtn) {
      e.stopPropagation();
      selectLecturer(maGiangVien);
    } else if (!checkbox) {
      selectLecturer(maGiangVien);
    }
  });

  document.querySelector(".section-3").addEventListener("change", (e) => {
    if (e.target.id === "checkAllLecturers") {
      let filtered = state.list;
      if (state.filterKeyword) {
        const kw = state.filterKeyword.toLowerCase();
        filtered = filtered.filter(
          (lec) =>
            lec.maGiangVien.toLowerCase().includes(kw) ||
            lec.ho.toLowerCase().includes(kw) ||
            lec.ten.toLowerCase().includes(kw) ||
            (lec.diaChi && lec.diaChi.toLowerCase().includes(kw)) ||
            (lec.sdt && lec.sdt.toLowerCase().includes(kw))
        );
      }
      const start = (state.currentPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);

      if (e.target.checked) {
        visible.forEach(item => {
          if (!state.checkedKeys.includes(item.maGiangVien)) {
            state.checkedKeys.push(item.maGiangVien);
          }
        });
      } else {
        visible.forEach(item => {
          const idx = state.checkedKeys.indexOf(item.maGiangVien);
          if (idx !== -1) state.checkedKeys.splice(idx, 1);
        });
      }
      updateSelection();
      renderRows();
    }

    if (e.target.classList.contains("lecturer-checkbox")) {
      const maGiangVien = e.target.value;
      if (e.target.checked) {
        if (!state.checkedKeys.includes(maGiangVien)) {
          state.checkedKeys.push(maGiangVien);
        }
      } else {
        const idx = state.checkedKeys.indexOf(maGiangVien);
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
    inputs.lastName.value = "";
    inputs.firstName.value = "";
    inputs.phone.value = "";
    inputs.address.value = "";
    setMode("create");
    inputs.code.focus();
  });

  buttons.btnEdit.addEventListener("click", () => {
    if (!state.selectedKey) return;
    setMode("edit");
    inputs.lastName.focus();
  });

  buttons.btnUndo.addEventListener("click", () => {
    setMode("view");
    if (state.selectedKey) {
      selectLecturer(state.selectedKey);
    } else {
      inputs.code.value = "";
      inputs.lastName.value = "";
      inputs.firstName.value = "";
      inputs.phone.value = "";
      inputs.address.value = "";
    }
  });

  buttons.btnSave.addEventListener("click", async () => {
    const payload = {
      maGiangVien: inputs.code.value.trim(),
      ho: inputs.lastName.value.trim(),
      ten: inputs.firstName.value.trim(),
      sdt: inputs.phone.value.trim(),
      diaChi: inputs.address.value.trim(),
    };

    if (!payload.maGiangVien || !payload.ho || !payload.ten) {
      notify.error("Vui lòng nhập đầy đủ Mã giảng viên, Họ và Tên.");
      return;
    }

    try {
      if (state.mode === "create") {
        const res = await requestJson(`${apiBase}/lecturers`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
        state.selectedKey = payload.maGiangVien;
        state.checkedKeys = [payload.maGiangVien];
      } else if (state.mode === "edit") {
        const res = await requestJson(`${apiBase}/lecturers/${encodeURIComponent(state.selectedKey)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
      }
      setMode("view");
      await loadLecturers();
      if (state.selectedKey) {
        selectLecturer(state.selectedKey);
      }
    } catch (e) {
      notify.error(e.message);
    }
  });

  buttons.btnDelete.addEventListener("click", async () => {
    const checkedCount = state.checkedKeys.length;
    if (checkedCount === 0) return;

    const confirmMessage = checkedCount === 1
      ? `Bạn có chắc chắn muốn xóa giảng viên ${state.checkedKeys[0]} không?`
      : `Bạn có chắc chắn muốn xóa ${checkedCount} giảng viên đã chọn không?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (checkedCount === 1) {
        const res = await requestJson(`${apiBase}/lecturers/${encodeURIComponent(state.checkedKeys[0])}`, {
          method: "DELETE",
        });
        notify.success(res.message);
      } else {
        const idsString = state.checkedKeys.join(",");
        const res = await requestJson(`${apiBase}/lecturers`, {
          method: "DELETE",
          body: JSON.stringify({ ids: idsString }),
        });
        notify.success(res.message);
      }
      state.checkedKeys = [];
      state.selectedKey = null;
      inputs.code.value = "";
      inputs.lastName.value = "";
      inputs.firstName.value = "";
      inputs.phone.value = "";
      inputs.address.value = "";
      await loadLecturers();
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
  loadLecturers();

})();
