const { getPool } = require("../../configs/database.config");

module.exports.index = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM GIAOVIEN) AS lecturers,
        (SELECT COUNT(*) FROM SINHVIEN) AS students,
        (SELECT COUNT(*) FROM LOP) AS classes,
        (SELECT COUNT(*) FROM MONHOC) AS subjects,
        (SELECT COUNT(*) FROM BODE) AS questions,
        (SELECT COUNT(*) FROM GIAOVIEN_DANGKY) AS registrations
    `);

    const stats = result.recordset[0] || {
      lecturers: 0,
      students: 0,
      classes: 0,
      subjects: 0,
      questions: 0,
      registrations: 0,
    };

    res.render("admin/pages/dashboard", {
      pageTitle: "Tổng quan",
      stats,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    res.render("admin/pages/dashboard", {
      pageTitle: "Tổng quan",
      stats: {
        lecturers: 0,
        students: 0,
        classes: 0,
        subjects: 0,
        questions: 0,
        registrations: 0,
      },
      error: "Không thể tải dữ liệu thống kê từ hệ thống.",
    });
  }
};
