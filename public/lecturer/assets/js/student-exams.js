(function () {
  const notify = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    dismissible: true
  });

  const apiBase = "/lecturer/student-exams";
  const pageSize = 10;

  const state = {
    list: [],
    currentPage: 1,
    filterKeyword: "",
  };

  const form = document.querySelector("#studentExamsForm");
  const inputs = {
    maLop: document.querySelector("#classSelect"),
    maMonHoc: document.querySelector("#subjectSelect"),
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

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  };

  const renderRows = () => {
    let filtered = state.list;
    if (state.filterKeyword) {
      const kw = state.filterKeyword.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.MASV.toLowerCase().includes(kw) ||
          `${row.HO || ""} ${row.TEN || ""}`.toLowerCase().includes(kw)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const start = (state.currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    buttons.tableBody.innerHTML = visible.length
      ? visible
          .map((item, idx) => {
            const hoTen = `${item.HO || ""} ${item.TEN || ""}`.trim();
            return `
            <tr>
              <td>${start + idx + 1}</td>
              <td>${escapeHtml(item.MASV)}</td>
              <td>${escapeHtml(hoTen)}</td>
              <td>Lần ${item.LAN}</td>
              <td>${escapeHtml(item.TRINHDO)}</td>
              <td>${formatDate(item.NGAYTHI)}</td>
              <td style="font-weight: 700; color: #10b981;">${item.DIEM !== null ? item.DIEM.toFixed(1) : "N/A"}</td>
              <td class="text-right">
                <a href="${apiBase}/detail/${item.ID}" class="inner-button-actions" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #e0e7ff; color: #4338ca; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 500; border: 1px solid #c7d2fe; transition: all 0.2s;">
                  <span class="material-symbols-outlined" style="font-size: 16px;">visibility</span>
                  <span>Xem chi tiết</span>
                </a>
              </td>
            </tr>`;
          })
          .join("")
      : '<tr><td colspan="8" class="text-center">Không có dữ liệu bài thi</td></tr>';

    buttons.paginationText.textContent = `Hiển thị ${visible.length} / ${filtered.length} bài thi`;
    buttons.prevPage.disabled = state.currentPage <= 1;
    buttons.nextPage.disabled = state.currentPage >= totalPages;
    buttons.pageList.textContent = `${state.currentPage} / ${totalPages}`;
  };

  const fetchStudentExams = async () => {
    const maLop = inputs.maLop.value;
    const maMonHoc = inputs.maMonHoc.value;

    if (!maLop || !maMonHoc) {
      return;
    }

    buttons.tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Đang tải danh sách bài thi...</td></tr>';

    try {
      const res = await requestJson(
        `${apiBase}/list?maLop=${encodeURIComponent(maLop)}&maMonHoc=${encodeURIComponent(maMonHoc)}`
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
    if (e.target === inputs.maLop || e.target === inputs.maMonHoc) {
      fetchStudentExams();
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

})();
