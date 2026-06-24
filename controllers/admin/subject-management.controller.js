const repo = require("../../repositories/admin/subject-management.repository");

module.exports.list = async (req, res) => {
  try {
    res.render("admin/pages/subject-management", {
      pageTitle: "Quản lý môn học",
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

module.exports.getSubjects = async (req, res) => {
  try {
    const data = await repo.getSubjects();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.createSubject = async (req, res) => {
  try {
    const { maMonHoc, tenMonHoc } = req.body;
    if (!maMonHoc || !tenMonHoc) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập Mã môn học và Tên môn học." });
    }
    await repo.createSubject({ maMonHoc, tenMonHoc });
    res.json({ success: true, message: "Thêm môn học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.updateSubject = async (req, res) => {
  try {
    const { mamh } = req.params;
    const { tenMonHoc } = req.body;
    if (!tenMonHoc) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập Tên môn học." });
    }
    await repo.updateSubject({ maMonHoc: mamh, tenMonHoc });
    res.json({ success: true, message: "Cập nhật môn học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.deleteSubject = async (req, res) => {
  try {
    const { mamh } = req.params;
    await repo.deleteSubject(mamh);
    res.json({ success: true, message: "Xóa môn học thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.deleteMultipleSubjects = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, message: "Danh sách môn học cần xóa không hợp lệ." });
    }
    await repo.deleteMultipleSubjects(ids);
    res.json({ success: true, message: "Xóa các môn học đã chọn thành công." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};