const repo = require("../../repositories/admin/account-create.repository");

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
    const lecturers = await repo.getLecturersWithoutAccount();
    res.render("admin/pages/account-create", {
      pageTitle: "Tạo tài khoản",
      lecturers,
    });
  } catch (e) {
    res.status(e.statusCode || 500).send(e.message);
  }
};

module.exports.getAccounts = async (req, res) => {
  try {
    assertPgv(req);
    const data = await repo.getAccounts();
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.getLecturersWithoutAccount = async (req, res) => {
  try {
    assertPgv(req);
    const data = await repo.getLecturersWithoutAccount();
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.createAccount = async (req, res) => {
  try {
    assertPgv(req);
    const { username, password, role, maGiangVien } = req.body;
    if (!username || !password || !role || !maGiangVien) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ tài khoản, mật khẩu, nhóm quyền và giảng viên tương ứng." });
    }
    await repo.createAccount({ username, password, role, maGiangVien });
    res.json({ success: true, message: "Tạo tài khoản thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.updateAccount = async (req, res) => {
  try {
    assertPgv(req);
    const { id } = req.params;
    const { password, role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn nhóm quyền." });
    }
    await repo.updateAccount({ id, password, role });
    res.json({ success: true, message: "Cập nhật tài khoản thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    assertPgv(req);
    const { id } = req.params;
    await repo.deleteAccount(id);
    res.json({ success: true, message: "Xóa tài khoản thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

module.exports.deleteMultipleAccounts = async (req, res) => {
  try {
    assertPgv(req);
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ success: false, message: "Danh sách tài khoản cần xóa không hợp lệ." });
    }
    await repo.deleteMultipleAccounts(ids);
    res.json({ success: true, message: "Xóa các tài khoản đã chọn thành công." });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};