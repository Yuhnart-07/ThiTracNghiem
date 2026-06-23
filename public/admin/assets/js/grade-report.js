(function () {
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/admin/grade-report";
  const pageSize = 10;

  const state = {
    list: [],
    currentPage: 1,
    filterKeyword: "",
  };

  const form = document.querySelector("#gradeReportForm");
  const inputs = {
    maLop: document.querySelector("#classSelect"),
    maMonHoc: document.querySelector("#subjectSelect"),
    lanThi: document.querySelector("#count"),
  };

  const buttons = {
    prevPage: document.querySelector("#btnPrevPage"),
    nextPage: document.querySelector("#btnNextPage"),
    pageList: document.querySelector("#pageList"),
    paginationText: document.querySelector("#paginationText"),
    tableBody: document.querySelector("#recordsTableBody"),
    filter: document.querySelector("#tableFilter"),
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
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

  const renderRows = () => {
    let filtered = state.list;
    if (state.filterKeyword) {
      const kw = state.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.maSinhVien.toLowerCase().includes(kw) ||
          row.ho.toLowerCase().includes(kw) ||
          row.ten.toLowerCase().includes(kw)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    buttons.tableBody.innerHTML = visible.length
      ? visible
          .map((item, idx) => {
            return `
            <tr>
              <td>${start + idx + 1}</td>
              <td>${escapeHtml(item.maSinhVien)}</td>
              <td>${escapeHtml(item.ho)}</td>
              <td>${escapeHtml(item.ten)}</td>
              <td>${item.diem !== null ? item.diem.toFixed(1) : "N/A"}</td>
              <td>${escapeHtml(item.diemChu || "N/A")}</td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="6" class="text-center">Không có dữ liệu điểm</td></tr>';

    buttons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} sinh viên`;
    buttons.prevPage.disabled = state.currentPage <= 1;
    buttons.nextPage.disabled = state.currentPage >= totalPages;
    buttons.pageList.textContent = `${state.currentPage} / ${totalPages}`;
  };

  const fetchReport = async () => {
    const maLop = inputs.maLop.value;
    const maMonHoc = inputs.maMonHoc.value;
    const lanThi = inputs.lanThi.value;

    if (!maLop || !maMonHoc || !lanThi) {
      return;
    }

    buttons.tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải bảng điểm...</td></tr>';

    try {
      const res = await requestJson(
        `${apiBase}/report?maLop=${encodeURIComponent(maLop)}&maMonHoc=${encodeURIComponent(maMonHoc)}&lanThi=${encodeURIComponent(lanThi)}`
      );
      state.list = res.data;
      state.currentPage = 1;
      renderRows();
    } catch (e) {
      notify.error(e.message);
      state.list = [];
      renderRows();
    }
  };

  // Event Listeners
  form.addEventListener("change", (e) => {
    if (e.target === inputs.maLop || e.target === inputs.maMonHoc || e.target === inputs.lanThi) {
      fetchReport();
    }
  });

  inputs.lanThi.addEventListener("input", () => {
    fetchReport();
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

})();
