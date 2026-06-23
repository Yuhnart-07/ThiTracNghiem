const repo = require("../../repositories/admin/lecturer-management.repository");

const assertPgv = (req) => {
  if (String(req.user?.role || "").toUpperCase() !== "PGV") {
    const error = new Error("Chỉ PGV được phép thực hiện thao tác này.");
    error.statusCode = req.user ? 403 : 401;
    throw error;
  }
};

module.exports.list = async (req, res) => {
  try {
    assertPgv(req);
    res.render("admin/pages/lecturer-management", {
      pageTitle: "Quản lý giảng viên",
    });
  } catch (e) {
    res.status(e.statusCode || 500).send(e.message);
  }
};

module.exports.getLecturers = async (req, res) => {
  try {
    assertPgv(req);
    const data = await repo.getLecturers();
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.createLecturer = async (req, res) => {
  try {
    assertPgv(req);
    const { maGiangVien, ho, ten, diaChi, sdt } = req.body;
    if (!maGiangVien || !ho || !ten) {
      return res.status(400).json({ success: false, message: "Mã GV, họ và tên là bắt buộc." });
    }
    await repo.createLecturer({ maGiangVien, ho, ten, diaChi, sdt });
    res.json({ success: true, message: "Thêm giảng viên thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.updateLecturer = async (req, res) => {
  try {
    assertPgv(req);
    const { magv } = req.params;
    const { ho, ten, diaChi, sdt } = req.body;
    if (!ho || !ten) {
      return res.status(400).json({ success: false, message: "Họ và tên là bắt buộc." });
    }
    await repo.updateLecturer({ maGiangVien: magv, ho, ten, diaChi, sdt });
    res.json({ success: true, message: "Cập nhật giảng viên thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.deleteLecturer = async (req, res) => {
  try {
    assertPgv(req);
    const { magv } = req.params;
    await repo.deleteLecturer(magv);
    res.json({ success: true, message: "Xóa giảng viên thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.deleteMultipleLecturers = async (req, res) => {
  try {
    assertPgv(req);
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, message: "Danh sách giảng viên cần xóa không hợp lệ." });
    }
    await repo.deleteMultipleLecturers(ids);
    res.json({ success: true, message: "Xóa các giảng viên đã chọn thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};