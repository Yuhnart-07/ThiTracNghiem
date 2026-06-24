(function () {
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/admin/account-create";
  const pageSize = 10;

  const state = {
    mode: "view", // view, create, edit
    list: [],
    lecturers: [],
    selectedKey: null, // ID của tài khoản
    checkedKeys: [], // danh sách các ID tài khoản được check chọn
    currentPage: 1,
    filterKeyword: "",
  };

  const form = document.querySelector("#accountCreateForm");
  const inputs = {
    fullName: document.querySelector("#fullName"),
    code: document.querySelector("#lecturerCode"),
    username: document.querySelector("#username"),
    password: document.querySelector("#password"),
    role: document.querySelector("#role"),
  };

  const buttons = {
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnSave: document.querySelector("#btnSave"),
    prevPage: document.querySelector("#btnPrevPage"),
    nextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
    paginationText: document.querySelector("#paginationText"),
    tableBody: document.querySelector("#recordsTableBody"),
    filter: document.querySelector("#tableFilter"),
    checkAll: document.querySelector("#checkAllAccounts"),
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

  const updatePasswordRequiredIndicator = () => {
    const indicator = document.querySelector(".password-required");
    if (indicator) {
      indicator.style.display = state.mode === "create" ? "inline" : "none";
    }
  };

  const setFormDisabled = (disabled) => {
    const isEdit = state.mode === "edit";
    const isPGV = inputs.role.value === "PGV";

    inputs.fullName.disabled = disabled || isEdit || isPGV;
    inputs.code.disabled = true; // mã giảng viên luôn luôn readonly
    inputs.username.disabled = disabled || isEdit;
    inputs.password.disabled = disabled;
    inputs.role.disabled = disabled || isEdit; // Không cho phép đổi vai trò trong chế độ edit để tránh lỗi logic

    form.classList.toggle("form-locked", disabled);
    updatePasswordRequiredIndicator();
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
    const badge = document.querySelector(".inner-badge");
    const labels = { view: "VIEW MODE", create: "CREATE MODE", edit: "EDIT MODE" };
    if (badge) {
      badge.textContent = labels[mode] || "VIEW MODE";
    }
    setFormDisabled(mode === "view");
    setButtonState();
  };

  const renderRows = () => {
    let filtered = state.list;
    if (state.filterKeyword) {
      const kw = state.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.username.toLowerCase().includes(kw) ||
          acc.role.toLowerCase().includes(kw) ||
          (acc.maGiangVien && acc.maGiangVien.toLowerCase().includes(kw)) ||
          (acc.ho && acc.ho.toLowerCase().includes(kw)) ||
          (acc.ten && acc.ten.toLowerCase().includes(kw))
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    if (buttons.checkAll) {
      const allVisibleChecked = visible.length > 0 && visible.every(item => state.checkedKeys.includes(String(item.id)));
      buttons.checkAll.checked = allVisibleChecked;
    }

    buttons.tableBody.innerHTML = visible.length
      ? visible
          .map((item) => {
            const idStr = String(item.id);
            const isChecked = state.checkedKeys.includes(idStr);
            const fullName = item.ho && item.ten ? `${item.ho} ${item.ten}` : "N/A";
            const maGV = item.maGiangVien || "N/A";
            return `
            <tr data-account-key="${idStr}" class="${isChecked ? "selected" : ""}">
              <td>
                <div class="checkbox-wrapper-30">
                  <span class="checkbox">
                    <input type="checkbox" name="selectedAccountCheckbox" class="account-checkbox" value="${idStr}" ${isChecked ? "checked" : ""} style="cursor:pointer;" />
                    <svg><use class="checkbox" xlink:href="#checkbox-30"></use></svg>
                  </span>
                </div>
              </td>
              <td>${escapeHtml(item.username)}</td>
              <td>${escapeHtml(maGV)}</td>
              <td>${escapeHtml(fullName)}</td>
              <td><span class="badge ${item.role === "PGV" ? "badge-success" : "badge-info"}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; background: ${item.role === "PGV" ? "#2f855a" : "#2b6cb0"}; color: #fff;">${escapeHtml(item.role)}</span></td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="5" class="text-center">Không có tài khoản nào</td></tr>';

    buttons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} tài khoản`;
    buttons.prevPage.disabled = state.currentPage <= 1;
    buttons.nextPage.disabled = state.currentPage >= totalPages;
    buttons.pageList.textContent = `${state.currentPage} / ${totalPages}`;
    setButtonState();
  };

  const populateLecturersSelect = () => {
    inputs.fullName.innerHTML = '<option value="">-- Chọn giảng viên --</option>' +
      state.lecturers
        .map(
          (lec) =>
            `<option value="${escapeHtml(lec.maGiangVien)}" data-code="${escapeHtml(
              lec.maGiangVien
            )}">${escapeHtml(lec.ho)} ${escapeHtml(lec.ten)}</option>`
        )
        .join("");
  };

  const loadData = async () => {
    try {
      const [accRes, lecRes] = await Promise.all([
        requestJson(`${apiBase}/accounts`),
        requestJson(`${apiBase}/lecturers`),
      ]);
      state.list = accRes.data;
      state.lecturers = lecRes.data;
      populateLecturersSelect();
      renderRows();
    } catch (e) {
      notify.error(e.message);
    }
  };

  const updateSelection = () => {
    const checkedCount = state.checkedKeys.length;
    if (checkedCount === 1) {
      state.selectedKey = state.checkedKeys[0];
      const item = state.list.find((acc) => String(acc.id) === state.selectedKey);
      if (item) {
        // Nếu giảng viên đã có tài khoản, cần tạm thêm họ vào dropdown để hiển thị được tên
        const isPresent = state.lecturers.some(l => l.maGiangVien === item.maGiangVien);
        if (item.maGiangVien && !isPresent) {
          state.lecturers.push({
            maGiangVien: item.maGiangVien,
            ho: item.ho,
            ten: item.ten
          });
          populateLecturersSelect();
        }

        inputs.fullName.value = item.maGiangVien || "";
        inputs.code.value = item.maGiangVien || "";
        inputs.username.value = item.username;
        inputs.password.value = "";
        inputs.role.value = item.role;
      }
    } else {
      state.selectedKey = null;
      inputs.fullName.value = "";
      inputs.code.value = "";
      inputs.username.value = "";
      inputs.password.value = "";
      inputs.role.value = "PGV";
    }
    setFormDisabled(state.mode === "view");
    setButtonState();
  };

  const selectAccount = (idStr) => {
    state.selectedKey = idStr;
    state.checkedKeys = [idStr];
    updateSelection();
    setMode("view");
    renderRows();
  };

  // Event Listeners
  buttons.tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-account-key]");
    if (!row) return;
    const idStr = row.dataset.accountKey;

    const selectBtn = e.target.closest(".select-account-btn");
    const checkbox = e.target.closest(".account-checkbox");

    if (selectBtn) {
      e.stopPropagation();
      selectAccount(idStr);
    } else if (!checkbox) {
      selectAccount(idStr);
    }
  });

  document.querySelector(".section-3").addEventListener("change", (e) => {
    if (e.target.id === "checkAllAccounts") {
      let filtered = state.list;
      if (state.filterKeyword) {
        const kw = state.filterKeyword.toLowerCase();
        filtered = filtered.filter(
          (acc) =>
            acc.username.toLowerCase().includes(kw) ||
            acc.role.toLowerCase().includes(kw) ||
            (acc.maGiangVien && acc.maGiangVien.toLowerCase().includes(kw))
        );
      }
      const start = (state.currentPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);

      if (e.target.checked) {
        visible.forEach(item => {
          const idStr = String(item.id);
          if (!state.checkedKeys.includes(idStr)) {
            state.checkedKeys.push(idStr);
          }
        });
      } else {
        visible.forEach(item => {
          const idStr = String(item.id);
          const idx = state.checkedKeys.indexOf(idStr);
          if (idx !== -1) state.checkedKeys.splice(idx, 1);
        });
      }
      updateSelection();
      renderRows();
    }

    if (e.target.classList.contains("account-checkbox")) {
      const idStr = e.target.value;
      if (e.target.checked) {
        if (!state.checkedKeys.includes(idStr)) {
          state.checkedKeys.push(idStr);
        }
      } else {
        const idx = state.checkedKeys.indexOf(idStr);
        if (idx !== -1) state.checkedKeys.splice(idx, 1);
      }
      updateSelection();
      renderRows();
    }
  });

  inputs.fullName.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    inputs.code.value = selectedOption ? selectedOption.dataset.code || "" : "";
  });

  inputs.role.addEventListener("change", (e) => {
    if (e.target.value === "PGV") {
      inputs.fullName.value = "";
      inputs.code.value = "";
      inputs.fullName.disabled = true;
    } else {
      if (state.mode !== "view" && state.mode !== "edit") {
        inputs.fullName.disabled = false;
      }
    }
  });

  buttons.btnAdd.addEventListener("click", () => {
    state.checkedKeys = [];
    state.selectedKey = null;
    inputs.fullName.value = "";
    inputs.code.value = "";
    inputs.username.value = "";
    inputs.password.value = "";
    inputs.role.value = "PGV";
    setMode("create");
    inputs.username.focus();
  });

  buttons.btnEdit.addEventListener("click", () => {
    if (!state.selectedKey) return;
    setMode("edit");
    inputs.password.focus();
  });

  buttons.btnUndo.addEventListener("click", () => {
    setMode("view");
    if (state.selectedKey) {
      selectAccount(state.selectedKey);
    } else {
      inputs.fullName.value = "";
      inputs.code.value = "";
      inputs.username.value = "";
      inputs.password.value = "";
      inputs.role.value = "PGV";
    }
  });

  buttons.btnSave.addEventListener("click", async () => {
    const payload = {
      username: inputs.username.value.trim(),
      password: inputs.password.value.trim(),
      role: inputs.role.value,
      maGiangVien: inputs.fullName.value,
    };

    if (!payload.username || !payload.role) {
      notify.error("Vui lòng nhập tài khoản và chọn nhóm quyền.");
      return;
    }

    if (state.mode === "create" && !payload.password) {
      notify.error("Mật khẩu là bắt buộc khi tạo tài khoản.");
      return;
    }

    if (payload.role === "GIANGVIEN" && !payload.maGiangVien) {
      notify.error("Vui lòng chọn giảng viên cho tài khoản giảng viên.");
      return;
    }

    try {
      if (state.mode === "create") {
        const res = await requestJson(`${apiBase}/accounts`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
      } else if (state.mode === "edit") {
        const res = await requestJson(`${apiBase}/accounts/${encodeURIComponent(state.selectedKey)}`, {
          method: "PUT",
          body: JSON.stringify({
            password: payload.password || null,
            role: payload.role
          }),
        });
        notify.success(res.message);
      }
      setMode("view");
      state.checkedKeys = [];
      state.selectedKey = null;
      await loadData();
    } catch (e) {
      notify.error(e.message);
    }
  });

  buttons.btnDelete.addEventListener("click", async () => {
    const checkedCount = state.checkedKeys.length;
    if (checkedCount === 0) return;

    const confirmMessage = checkedCount === 1
      ? `Bạn có chắc chắn muốn xóa tài khoản này không?`
      : `Bạn có chắc chắn muốn xóa ${checkedCount} tài khoản đã chọn không?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (checkedCount === 1) {
        const res = await requestJson(`${apiBase}/accounts/${encodeURIComponent(state.checkedKeys[0])}`, {
          method: "DELETE",
        });
        notify.success(res.message);
      } else {
        const idsString = state.checkedKeys.join(",");
        const res = await requestJson(`${apiBase}/accounts`, {
          method: "DELETE",
          body: JSON.stringify({ ids: idsString }),
        });
        notify.success(res.message);
      }
      state.checkedKeys = [];
      state.selectedKey = null;
      await loadData();
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
  loadData();

})();
