const classRepo = require("../../repositories/admin/class-management.repository");
const subjectRepo = require("../../repositories/admin/subject-management.repository");
const gradeRepo = require("../../repositories/admin/grade-report.repository");

const assertCanAccessReport = (req) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (role !== "PGV" && role !== "GIANGVIEN") {
    const error = new Error("Chỉ PGV hoặc Giảng viên được phép thực hiện thao tác này.");
    error.statusCode = req.user ? 403 : 401;
    throw error;
  }
};

module.exports.list = async (req, res) => {
  try {
    assertCanAccessReport(req);
    const classes = await classRepo.getDanhSachLop();
    const subjects = await subjectRepo.getSubjects();
    res.render("admin/pages/grade-report", {
      pageTitle: "Bảng điểm",
      classes,
      subjects,
    });
  } catch (e) {
    res.status(e.statusCode || 500).send(e.message);
  }
};

module.exports.getReport = async (req, res) => {
  try {
    assertCanAccessReport(req);
    const { maLop, maMonHoc, lanThi } = req.query;
    if (!maLop || !maMonHoc || !lanThi) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn đầy đủ Lớp, Môn học và Lần thi." });
    }
    const data = await gradeRepo.getGradeReport({ maLop, maMonHoc, lanThi });
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};