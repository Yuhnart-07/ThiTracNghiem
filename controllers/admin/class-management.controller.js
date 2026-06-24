const repo = require("../../repositories/admin/class-management.repository");

// 1. Render class-management page
module.exports.list = async (req, res) => {
  try {
    const classes = await repo.getDanhSachLop();
    res.render("admin/pages/class-management", {
      pageTitle: "Quản lý lớp học và sinh viên",
      classes,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// 2. GET classes list
module.exports.getClasses = async (req, res) => {
  try {
    const classes = await repo.getDanhSachLop();
    res.json({ success: true, data: classes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 3. Add class
module.exports.addClass = async (req, res) => {
  try {
    const { maLop, tenLop } = req.body;
    if (!maLop || !tenLop) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Mã lớp và Tên lớp." });
    }
    await repo.themLop({ maLop, tenLop });
    res.json({ success: true, message: "Thêm lớp học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 4. Update class
module.exports.updateClass = async (req, res) => {
  try {
    const { malop } = req.params;
    const { tenLop } = req.body;
    if (!tenLop) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập Tên lớp." });
    }
    await repo.suaLop({ maLop: malop, tenLop });
    res.json({ success: true, message: "Cập nhật lớp học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 5. Delete class
module.exports.deleteClass = async (req, res) => {
  try {
    const { malop } = req.params;
    await repo.xoaLop(malop);
    res.json({ success: true, message: "Xóa lớp học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 6. GET students list by class
module.exports.getStudentsByClass = async (req, res) => {
  try {
    const { malop } = req.query;
    if (!malop || malop === "undefined" || malop === "null") {
      return res.json({ success: true, data: [] });
    }
    const students = await repo.getSinhVienByLop(malop);
    res.json({ success: true, data: students });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 7. Add student
module.exports.addStudent = async (req, res) => {
  try {
    const { maSinhVien, ho, ten, ngaySinh, diaChi, maLop } = req.body;
    if (!maSinhVien || !ho || !ten || !maLop) {
      return res.status(400).json({ success: false, message: "Mã SV, họ tên và lớp là bắt buộc." });
    }
    await repo.themSinhVien({ maSinhVien, ho, ten, ngaySinh, diaChi, maLop });
    res.json({ success: true, message: "Thêm sinh viên thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 8. Update student
module.exports.updateStudent = async (req, res) => {
  try {
    const { masv } = req.params;
    const { ho, ten, ngaySinh, diaChi } = req.body;
    if (!ho || !ten) {
      return res.status(400).json({ success: false, message: "Họ và tên là bắt buộc." });
    }
    await repo.suaSinhVien({ maSinhVien: masv, ho, ten, ngaySinh, diaChi });
    res.json({ success: true, message: "Cập nhật sinh viên thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 9. Delete student
module.exports.deleteStudent = async (req, res) => {
  try {
    const { masv } = req.params;
    await repo.xoaSinhVien(masv);
    res.json({ success: true, message: "Xóa sinh viên thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 10. Delete multiple classes
module.exports.deleteClasses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, message: "Danh sách mã lớp cần xóa không hợp lệ." });
    }
    await repo.xoaNhieuLop(ids);
    res.json({ success: true, message: "Xóa các lớp học đã chọn thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// 11. Delete multiple students
module.exports.deleteStudents = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, message: "Danh sách sinh viên cần xóa không hợp lệ." });
    }
    await repo.xoaNhieuSinhVien(ids);
    res.json({ success: true, message: "Xóa các sinh viên đã chọn thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};