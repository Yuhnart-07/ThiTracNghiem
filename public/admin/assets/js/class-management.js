(function () {
  // KHỞI TẠO NOTYF
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/admin/class-management";
  const pageSize = 10;

  // LỚP HỌC STATE
  const classState = {
    mode: "view", // view, create, edit
    list: [],
    selectedKey: null, // maLop đang hiển thị chi tiết trong inputs
    checkedKeys: [], // danh sách các maLop được check chọn xóa
    currentPage: 1,
    filterKeyword: "",
  };

  // SINH VIÊN STATE
  const studentState = {
    mode: "view", // view, create, edit
    list: [],
    selectedKey: null, // maSinhVien đang hiển thị chi tiết trong inputs
    checkedKeys: [], // danh sách các maSinhVien được check chọn xóa
    currentPage: 1,
    filterKeyword: "",
  };

  // DOM Containers
  const classViewContainer = document.querySelector("#classViewContainer");
  const studentSubformContainer = document.querySelector("#studentSubformContainer");

  // DOM Elements - Class
  const cForm = document.querySelector("#classForm");
  const cInputs = {
    code: document.querySelector("#classCode"),
    name: document.querySelector("#className"),
  };
  const cButtons = {
    btnAdd: document.querySelector("#btnAdd"),
    btnEdit: document.querySelector("#btnEdit"),
    btnDelete: document.querySelector("#btnDelete"),
    btnUndo: document.querySelector("#btnUndo"),
    btnSave: document.querySelector("#btnSave"),
    btnSearch: document.querySelector("#btnSearch"),
    prevPage: document.querySelector("#btnClassPrevPage"),
    nextPage: document.querySelector("#btnClassNextPage"),
    pageList: document.querySelector("#classPageList"),
    paginationText: document.querySelector("#classPaginationText"),
    tableBody: document.querySelector("#classTableBody"),
    filter: document.querySelector("#classTableFilter"),
    modeBadge: document.querySelector(".inner-badge"),
    goToSubform: document.querySelector("#btnGoToSubform"),
  };

  // DOM Elements - Student Subform
  const btnBackToClass = document.querySelector("#btnBackToClass");
  const sLabel = document.querySelector("#selectedClassNameLabel");
  const sForm = document.querySelector("#studentForm");
  const sInputs = {
    id: document.querySelector("#studentId"),
    lastName: document.querySelector("#studentLastName"),
    firstName: document.querySelector("#studentFirstName"),
    birth: document.querySelector("#studentBirth"),
    address: document.querySelector("#studentAddress"),
  };
  const sButtons = {
    btnAdd: document.querySelector("#svBtnAdd"),
    btnEdit: document.querySelector("#svBtnEdit"),
    btnDelete: document.querySelector("#svBtnDelete"),
    btnUndo: document.querySelector("#svBtnUndo"),
    btnSave: document.querySelector("#svBtnSave"),
    btnSearch: document.querySelector("#svBtnSearch"),
    prevPage: document.querySelector("#btnStudentPrevPage"),
    nextPage: document.querySelector("#btnStudentNextPage"),
    pageList: document.querySelector("#studentPageList"),
    paginationText: document.querySelector("#studentPaginationText"),
    tableBody: document.querySelector("#studentTableBody"),
    filter: document.querySelector("#studentTableFilter"),
    modeBadge: document.querySelector("#svModeBadge"),
  };

  // Helper request function
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

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const toInputDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // LOGIC CHO LỚP HỌC (CLASS)
  // ==========================================
  
  const setClassFormDisabled = (disabled) => {
    cInputs.code.disabled = disabled || classState.mode === "edit";
    cInputs.name.disabled = disabled;
    cForm.classList.toggle("form-locked", disabled);
  };

  const setClassButtonState = () => {
    const checkedCount = classState.checkedKeys.length;
    const editing = classState.mode === "create" || classState.mode === "edit";

    cButtons.btnAdd.disabled = editing;
    cButtons.btnAdd.classList.toggle("disabled", editing);

    // Bật hiệu chỉnh khi và chỉ khi chọn đúng 1 hàng và không trong chế độ edit/create
    cButtons.btnEdit.disabled = checkedCount !== 1 || editing;
    cButtons.btnEdit.classList.toggle("disabled", checkedCount !== 1 || editing);

    // Bật xóa khi chọn ít nhất 1 hàng và không trong chế độ edit/create
    cButtons.btnDelete.disabled = checkedCount === 0 || editing;
    cButtons.btnDelete.classList.toggle("disabled", checkedCount === 0 || editing);

    cButtons.btnUndo.disabled = !editing;
    cButtons.btnUndo.classList.toggle("disabled", !editing);

    cButtons.btnSave.disabled = !editing;
    cButtons.btnSave.classList.toggle("disabled", !editing);

    // Nút chuyển sang subform quản lý sinh viên (chỉ khả dụng khi chọn đúng 1 lớp)
    if (cButtons.goToSubform) {
      cButtons.goToSubform.disabled = checkedCount !== 1;
      cButtons.goToSubform.classList.toggle("disabled", checkedCount !== 1);
    }
  };

  const setClassMode = (mode) => {
    classState.mode = mode;
    const labels = { view: "VIEW MODE", create: "CREATE MODE", edit: "EDIT MODE" };
    cButtons.modeBadge.textContent = labels[mode] || "VIEW MODE";
    setClassFormDisabled(mode === "view");
    setClassButtonState();
  };

  const renderClassRows = () => {
    let filtered = classState.list;
    if (classState.filterKeyword) {
      const kw = classState.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (c) => c.maLop.toLowerCase().includes(kw) || c.tenLop.toLowerCase().includes(kw)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    classState.currentPage = Math.min(classState.currentPage, totalPages);
    const start = (classState.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    // Trạng thái ô Check All Classes
    const checkAllClassesInput = document.querySelector("#checkAllClasses");
    if (checkAllClassesInput) {
      const allVisibleChecked = visible.length > 0 && visible.every(item => classState.checkedKeys.includes(item.maLop));
      checkAllClassesInput.checked = allVisibleChecked;
    }

    cButtons.tableBody.innerHTML = visible.length
      ? visible
          .map((item) => {
            const isChecked = classState.checkedKeys.includes(item.maLop);
            return `
            <tr data-class-key="${escapeHtml(item.maLop)}" class="${isChecked ? "selected" : ""}">
              <td>
                <div class="checkbox-wrapper-30">
                  <span class="checkbox">
                    <input type="checkbox" name="selectedClassCheckbox" class="class-checkbox" value="${escapeHtml(item.maLop)}" ${isChecked ? "checked" : ""} style="cursor:pointer;" />
                    <svg><use class="checkbox" xlink:href="#checkbox-30"></use></svg>
                  </span>
                </div>
              </td>
              <td>${escapeHtml(item.maLop)}</td>
              <td>${escapeHtml(item.tenLop)}</td>
              <td class="text-center">${item.soSinhVien}</td>
              <td class="text-right">
                <button class="inner-button select-class-btn" data-class-key="${escapeHtml(item.maLop)}" style="padding: 4px 8px; font-size: 0.8rem; background: #3182ce; color: #fff;">
                  Quản lý SV
                </button>
              </td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="5" class="text-center">Không có lớp học nào</td></tr>';

    cButtons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} lớp`;
    cButtons.prevPage.disabled = classState.currentPage <= 1;
    cButtons.nextPage.disabled = classState.currentPage >= totalPages;
    cButtons.pageList.textContent = `${classState.currentPage} / ${totalPages}`;
    setClassButtonState();
  };

  const loadClasses = async () => {
    try {
      const res = await requestJson(`${apiBase}/classes`);
      classState.list = res.data;
      renderClassRows();
    } catch (e) {
      notify.error(e.message);
    }
  };

  const updateClassSelection = () => {
    const checkedCount = classState.checkedKeys.length;
    if (checkedCount === 1) {
      classState.selectedKey = classState.checkedKeys[0];
      const item = classState.list.find((c) => c.maLop === classState.selectedKey);
      if (item) {
        cInputs.code.value = item.maLop;
        cInputs.name.value = item.tenLop;
        sLabel.textContent = `${item.maLop} - ${item.tenLop}`;
      }
    } else {
      classState.selectedKey = null;
      clearClassForm();
    }
    setClassButtonState();
  };

  const selectClass = async (maLop, shouldSwitchToSubform = false) => {
    classState.selectedKey = maLop;
    classState.checkedKeys = [maLop]; // Tự động check hàng đó
    
    const item = classState.list.find((c) => c.maLop === maLop);
    if (!item) return;

    cInputs.code.value = item.maLop;
    cInputs.name.value = item.tenLop;

    sLabel.textContent = `${item.maLop} - ${item.tenLop}`;

    // Reset student states
    studentState.checkedKeys = [];
    studentState.selectedKey = null;
    studentState.currentPage = 1;
    setStudentMode("view");
    clearStudentForm();

    await loadStudents(maLop);
    renderClassRows();

    if (shouldSwitchToSubform) {
      switchToStudentSubform();
    }
  };

  const clearClassForm = () => {
    cInputs.code.value = "";
    cInputs.name.value = "";
  };

  const switchToStudentSubform = () => {
    if (!classState.selectedKey) {
      notify.error("Vui lòng chọn lớp học trước.");
      return;
    }
    classViewContainer.style.display = "none";
    studentSubformContainer.style.display = "block";
  };

  const switchToClassView = async () => {
    studentSubformContainer.style.display = "none";
    classViewContainer.style.display = "block";
    classState.checkedKeys = [];
    classState.selectedKey = null;
    clearClassForm();
    await loadClasses();
  };

  // Class view event listeners
  cButtons.tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-class-key]");
    if (!row) return;
    const maLop = row.dataset.classKey;

    const manageBtn = e.target.closest(".select-class-btn");
    const checkbox = e.target.closest(".class-checkbox");

    if (manageBtn) {
      e.stopPropagation();
      selectClass(maLop, true);
    } else if (checkbox) {
      // Do nothing, event will bubble up to checkbox change handler
    } else {
      // Click on row toggles selection (makes it single selection)
      selectClass(maLop, false);
    }
  });

  // Handle Class Checkbox actions
  classViewContainer.addEventListener("change", (e) => {
    if (e.target.id === "checkAllClasses") {
      let filtered = classState.list;
      if (classState.filterKeyword) {
        const kw = classState.filterKeyword.toLowerCase();
        filtered = filtered.filter(
          (c) => c.maLop.toLowerCase().includes(kw) || c.tenLop.toLowerCase().includes(kw)
        );
      }
      const start = (classState.currentPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);

      if (e.target.checked) {
        visible.forEach(item => {
          if (!classState.checkedKeys.includes(item.maLop)) {
            classState.checkedKeys.push(item.maLop);
          }
        });
      } else {
        visible.forEach(item => {
          const idx = classState.checkedKeys.indexOf(item.maLop);
          if (idx !== -1) classState.checkedKeys.splice(idx, 1);
        });
      }
      updateClassSelection();
      renderClassRows();
    }

    if (e.target.classList.contains("class-checkbox")) {
      const maLop = e.target.value;
      if (e.target.checked) {
        if (!classState.checkedKeys.includes(maLop)) {
          classState.checkedKeys.push(maLop);
        }
      } else {
        const idx = classState.checkedKeys.indexOf(maLop);
        if (idx !== -1) classState.checkedKeys.splice(idx, 1);
      }
      updateClassSelection();
      renderClassRows();
    }
  });

  cButtons.goToSubform.addEventListener("click", () => {
    switchToStudentSubform();
  });

  btnBackToClass.addEventListener("click", () => {
    switchToClassView();
  });

  cButtons.btnAdd.addEventListener("click", () => {
    classState.checkedKeys = [];
    classState.selectedKey = null;
    clearClassForm();
    setClassMode("create");
    cInputs.code.focus();
  });

  cButtons.btnEdit.addEventListener("click", () => {
    if (!classState.selectedKey) return;
    setClassMode("edit");
    cInputs.name.focus();
  });

  cButtons.btnUndo.addEventListener("click", () => {
    setClassMode("view");
    if (classState.selectedKey) {
      const item = classState.list.find((c) => c.maLop === classState.selectedKey);
      if (item) {
        cInputs.code.value = item.maLop;
        cInputs.name.value = item.tenLop;
      }
    } else {
      clearClassForm();
    }
  });

  cButtons.btnSave.addEventListener("click", async () => {
    const payload = {
      maLop: cInputs.code.value.trim(),
      tenLop: cInputs.name.value.trim(),
    };

    if (!payload.maLop || !payload.tenLop) {
      notify.error("Vui lòng nhập đầy đủ thông tin Lớp.");
      return;
    }

    try {
      if (classState.mode === "create") {
        const res = await requestJson(`${apiBase}/classes`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
        classState.selectedKey = payload.maLop;
        classState.checkedKeys = [payload.maLop];
      } else if (classState.mode === "edit") {
        const res = await requestJson(`${apiBase}/classes/${encodeURIComponent(classState.selectedKey)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
      }
      setClassMode("view");
      await loadClasses();
      if (classState.selectedKey) {
        selectClass(classState.selectedKey, false);
      }
    } catch (e) {
      notify.error(e.message);
    }
  });

  cButtons.btnDelete.addEventListener("click", async () => {
    const checkedCount = classState.checkedKeys.length;
    if (checkedCount === 0) return;

    const confirmMessage = checkedCount === 1 
      ? `Bạn có chắc chắn muốn xóa lớp học ${classState.checkedKeys[0]} không? Tất cả sinh viên trong lớp phải được xóa trước.`
      : `Bạn có chắc chắn muốn xóa ${checkedCount} lớp học đã chọn không? Tất cả sinh viên trong các lớp phải được xóa trước.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (checkedCount === 1) {
        const res = await requestJson(`${apiBase}/classes/${encodeURIComponent(classState.checkedKeys[0])}`, {
          method: "DELETE",
        });
        notify.success(res.message);
      } else {
        const idsString = classState.checkedKeys.join(",");
        const res = await requestJson(`${apiBase}/classes`, {
          method: "DELETE",
          body: JSON.stringify({ ids: idsString }),
        });
        notify.success(res.message);
      }
      classState.checkedKeys = [];
      classState.selectedKey = null;
      clearClassForm();
      await loadClasses();
    } catch (e) {
      notify.error(e.message);
    }
  });

  cButtons.filter.addEventListener("input", (e) => {
    classState.filterKeyword = e.target.value;
    classState.currentPage = 1;
    renderClassRows();
  });

  cButtons.prevPage.addEventListener("click", () => {
    if (classState.currentPage > 1) {
      classState.currentPage--;
      renderClassRows();
    }
  });

  cButtons.nextPage.addEventListener("click", () => {
    const totalPages = Math.ceil(classState.list.length / pageSize);
    if (classState.currentPage < totalPages) {
      classState.currentPage++;
      renderClassRows();
    }
  });

  // ==========================================
  // LOGIC CHO SINH VIÊN (STUDENTS)
  // ==========================================
  
  const setStudentFormDisabled = (disabled) => {
    sInputs.id.disabled = disabled || studentState.mode === "edit";
    sInputs.lastName.disabled = disabled;
    sInputs.firstName.disabled = disabled;
    sInputs.birth.disabled = disabled;
    sInputs.address.disabled = disabled;
    sForm.classList.toggle("form-locked", disabled);
  };

  const setStudentButtonState = () => {
    const checkedCount = studentState.checkedKeys.length;
    const editing = studentState.mode === "create" || studentState.mode === "edit";

    sButtons.btnAdd.disabled = editing;
    sButtons.btnAdd.classList.toggle("disabled", editing);

    // Bật hiệu chỉnh khi và chỉ khi chọn đúng 1 sinh viên
    sButtons.btnEdit.disabled = checkedCount !== 1 || editing;
    sButtons.btnEdit.classList.toggle("disabled", checkedCount !== 1 || editing);

    // Bật xóa khi chọn ít nhất 1 sinh viên
    sButtons.btnDelete.disabled = checkedCount === 0 || editing;
    sButtons.btnDelete.classList.toggle("disabled", checkedCount === 0 || editing);

    sButtons.btnUndo.disabled = !editing;
    sButtons.btnUndo.classList.toggle("disabled", !editing);

    sButtons.btnSave.disabled = !editing;
    sButtons.btnSave.classList.toggle("disabled", !editing);
  };

  const setStudentMode = (mode) => {
    studentState.mode = mode;
    const labels = { view: "VIEW MODE", create: "CREATE MODE", edit: "EDIT MODE" };
    sButtons.modeBadge.textContent = labels[mode] || "VIEW MODE";
    setStudentFormDisabled(mode === "view");
    setStudentButtonState();
  };

  const renderStudentRows = () => {
    let filtered = studentState.list;
    if (studentState.filterKeyword) {
      const kw = studentState.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.maSinhVien.toLowerCase().includes(kw) ||
          s.ho.toLowerCase().includes(kw) ||
          s.ten.toLowerCase().includes(kw) ||
          (s.diaChi && s.diaChi.toLowerCase().includes(kw))
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    studentState.currentPage = Math.min(studentState.currentPage, totalPages);
    const start = (studentState.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    // Trạng thái Check All Students
    const checkAllStudentsInput = document.querySelector("#checkAllStudents");
    if (checkAllStudentsInput) {
      const allVisibleChecked = visible.length > 0 && visible.every(item => studentState.checkedKeys.includes(item.maSinhVien));
      checkAllStudentsInput.checked = allVisibleChecked;
    }

    sButtons.tableBody.innerHTML = visible.length
      ? visible
          .map((item) => {
            const isChecked = studentState.checkedKeys.includes(item.maSinhVien);
            return `
            <tr data-student-key="${escapeHtml(item.maSinhVien)}" class="${isChecked ? "selected" : ""}">
              <td>
                <div class="checkbox-wrapper-30">
                  <span class="checkbox">
                    <input type="checkbox" name="selectedStudentCheckbox" class="student-checkbox" value="${escapeHtml(item.maSinhVien)}" ${isChecked ? "checked" : ""} style="cursor:pointer;" />
                    <svg><use class="checkbox" xlink:href="#checkbox-30"></use></svg>
                  </span>
                </div>
              </td>
              <td>${escapeHtml(item.maSinhVien)}</td>
              <td>${escapeHtml(item.ho)} ${escapeHtml(item.ten)}</td>
              <td>${formatDate(item.ngaySinh)}</td>
              <td>${escapeHtml(item.diaChi || "")}</td>
              <td class="text-right">
                <button class="inner-button sv-delete-row-btn" data-student-key="${escapeHtml(item.maSinhVien)}" style="padding: 4px 8px; font-size: 0.8rem; background: #e53e3e; color: #fff;">
                  Xóa
                </button>
              </td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="6" class="text-center">Lớp này chưa có sinh viên nào</td></tr>';

    sButtons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} sinh viên`;
    sButtons.prevPage.disabled = studentState.currentPage <= 1;
    sButtons.nextPage.disabled = studentState.currentPage >= totalPages;
    sButtons.pageList.textContent = `${studentState.currentPage} / ${totalPages}`;
    setStudentButtonState();
  };

  const loadStudents = async (maLop) => {
    try {
      const res = await requestJson(`${apiBase}/students?malop=${encodeURIComponent(maLop)}`);
      studentState.list = res.data;
      renderStudentRows();
    } catch (e) {
      notify.error(e.message);
    }
  };

  const updateStudentSelection = () => {
    const checkedCount = studentState.checkedKeys.length;
    if (checkedCount === 1) {
      studentState.selectedKey = studentState.checkedKeys[0];
      const item = studentState.list.find((s) => s.maSinhVien === studentState.selectedKey);
      if (item) {
        sInputs.id.value = item.maSinhVien;
        sInputs.lastName.value = item.ho;
        sInputs.firstName.value = item.ten;
        sInputs.birth.value = toInputDate(item.ngaySinh);
        sInputs.address.value = item.diaChi || "";
      }
    } else {
      studentState.selectedKey = null;
      clearStudentForm();
    }
    setStudentButtonState();
  };

  const selectStudent = (maSinhVien) => {
    studentState.selectedKey = maSinhVien;
    studentState.checkedKeys = [maSinhVien]; // check duy nhất sinh viên này
    
    const item = studentState.list.find((s) => s.maSinhVien === maSinhVien);
    if (!item) return;

    sInputs.id.value = item.maSinhVien;
    sInputs.lastName.value = item.ho;
    sInputs.firstName.value = item.ten;
    sInputs.birth.value = toInputDate(item.ngaySinh);
    sInputs.address.value = item.diaChi || "";

    setStudentMode("view");
    renderStudentRows();
  };

  const clearStudentForm = () => {
    sInputs.id.value = "";
    sInputs.lastName.value = "";
    sInputs.firstName.value = "";
    sInputs.birth.value = "";
    sInputs.address.value = "";
  };

  // Student list event listeners
  sButtons.tableBody.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".sv-delete-row-btn");
    const row = e.target.closest("tr[data-student-key]");
    if (!row) return;

    const maSinhVien = row.dataset.studentKey;

    if (deleteBtn) {
      e.stopPropagation();
      if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${maSinhVien}?`)) return;
      try {
        const res = await requestJson(`${apiBase}/students/${encodeURIComponent(maSinhVien)}`, {
          method: "DELETE",
        });
        notify.success(res.message);
        studentState.checkedKeys = [];
        studentState.selectedKey = null;
        clearStudentForm();
        await loadStudents(classState.selectedKey);
      } catch (err) {
        notify.error(err.message);
      }
    } else {
      const checkbox = e.target.closest(".student-checkbox");
      if (!checkbox) {
        selectStudent(maSinhVien);
      }
    }
  });

  // Handle Student Checkboxes events
  studentSubformContainer.addEventListener("change", (e) => {
    if (e.target.id === "checkAllStudents") {
      let filtered = studentState.list;
      if (studentState.filterKeyword) {
        const kw = studentState.filterKeyword.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.maSinhVien.toLowerCase().includes(kw) ||
            s.ho.toLowerCase().includes(kw) ||
            s.ten.toLowerCase().includes(kw) ||
            (s.diaChi && s.diaChi.toLowerCase().includes(kw))
        );
      }
      const start = (studentState.currentPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);

      if (e.target.checked) {
        visible.forEach(item => {
          if (!studentState.checkedKeys.includes(item.maSinhVien)) {
            studentState.checkedKeys.push(item.maSinhVien);
          }
        });
      } else {
        visible.forEach(item => {
          const idx = studentState.checkedKeys.indexOf(item.maSinhVien);
          if (idx !== -1) studentState.checkedKeys.splice(idx, 1);
        });
      }
      updateStudentSelection();
      renderStudentRows();
    }

    if (e.target.classList.contains("student-checkbox")) {
      const maSinhVien = e.target.value;
      if (e.target.checked) {
        if (!studentState.checkedKeys.includes(maSinhVien)) {
          studentState.checkedKeys.push(maSinhVien);
        }
      } else {
        const idx = studentState.checkedKeys.indexOf(maSinhVien);
        if (idx !== -1) studentState.checkedKeys.splice(idx, 1);
      }
      updateStudentSelection();
      renderStudentRows();
    }
  });

  sButtons.btnAdd.addEventListener("click", () => {
    if (!classState.selectedKey) {
      notify.error("Lỗi hệ thống: Chưa xác định lớp.");
      return;
    }
    studentState.checkedKeys = [];
    studentState.selectedKey = null;
    clearStudentForm();
    setStudentMode("create");
    sInputs.id.focus();
  });

  sButtons.btnEdit.addEventListener("click", () => {
    if (!studentState.selectedKey) return;
    setStudentMode("edit");
    sInputs.lastName.focus();
  });

  sButtons.btnUndo.addEventListener("click", () => {
    setStudentMode("view");
    if (studentState.selectedKey) {
      selectStudent(studentState.selectedKey);
    } else {
      clearStudentForm();
    }
  });

  sButtons.btnSave.addEventListener("click", async () => {
    if (!classState.selectedKey) {
      notify.error("Lỗi: Chưa chọn lớp học.");
      return;
    }

    const payload = {
      maSinhVien: sInputs.id.value.trim(),
      ho: sInputs.lastName.value.trim(),
      ten: sInputs.firstName.value.trim(),
      ngaySinh: sInputs.birth.value || null,
      diaChi: sInputs.address.value.trim(),
      maLop: classState.selectedKey, // auto-fill MALOP
    };

    if (!payload.maSinhVien || !payload.ho || !payload.ten) {
      notify.error("Vui lòng nhập Mã SV, Họ và Tên sinh viên.");
      return;
    }

    try {
      if (studentState.mode === "create") {
        const res = await requestJson(`${apiBase}/students`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
        studentState.selectedKey = payload.maSinhVien;
        studentState.checkedKeys = [payload.maSinhVien];
      } else if (studentState.mode === "edit") {
        const res = await requestJson(`${apiBase}/students/${encodeURIComponent(studentState.selectedKey)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify.success(res.message);
      }
      setStudentMode("view");
      await loadStudents(classState.selectedKey);
      if (studentState.selectedKey) {
        selectStudent(studentState.selectedKey);
      }
    } catch (e) {
      notify.error(e.message);
    }
  });

  sButtons.btnDelete.addEventListener("click", async () => {
    const checkedCount = studentState.checkedKeys.length;
    if (checkedCount === 0) return;

    const confirmMessage = checkedCount === 1 
      ? `Bạn có chắc muốn xóa sinh viên ${studentState.checkedKeys[0]}?`
      : `Bạn có chắc muốn xóa ${checkedCount} sinh viên đã chọn?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (checkedCount === 1) {
        const res = await requestJson(`${apiBase}/students/${encodeURIComponent(studentState.checkedKeys[0])}`, {
          method: "DELETE",
        });
        notify.success(res.message);
      } else {
        const idsString = studentState.checkedKeys.join(",");
        const res = await requestJson(`${apiBase}/students`, {
          method: "DELETE",
          body: JSON.stringify({ ids: idsString }),
        });
        notify.success(res.message);
      }
      studentState.checkedKeys = [];
      studentState.selectedKey = null;
      clearStudentForm();
      await loadStudents(classState.selectedKey);
    } catch (e) {
      notify.error(e.message);
    }
  });

  sButtons.filter.addEventListener("input", (e) => {
    studentState.filterKeyword = e.target.value;
    studentState.currentPage = 1;
    renderStudentRows();
  });

  sButtons.prevPage.addEventListener("click", () => {
    if (studentState.currentPage > 1) {
      studentState.currentPage--;
      renderStudentRows();
    }
  });

  sButtons.nextPage.addEventListener("click", () => {
    const totalPages = Math.ceil(studentState.list.length / pageSize);
    if (studentState.currentPage < totalPages) {
      studentState.currentPage++;
      renderStudentRows();
    }
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  setClassMode("view");
  loadClasses();

})();
