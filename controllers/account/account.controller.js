const accountRepository = require("../../repositories/account/account.repository");
const { clearAuthCookie, setAuthCookie } = require("../../configs/auth.config");

module.exports.login = (req, res) => {
  res.render("account/login", {
    pageTitle: "Đăng nhập",
    errorMessage: null,
  });
};

module.exports.loginSubmit = async (req, res) => {
  const role = req.body.role;
  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  if (role !== "admin") {
    return res.status(403).render("account/login", {
      pageTitle: "Đăng nhập",
      errorMessage: "Sinh viên không được truy cập module nhập câu hỏi thi.",
    });
  }

  if (!username || !password) {
    return res.status(400).render("account/login", {
      pageTitle: "Đăng nhập",
      errorMessage: "Vui lòng nhập tài khoản và mật khẩu.",
    });
  }

  const user = await accountRepository.loginLecturerAdmin({ username, password });

  if (!user) {
    return res.status(401).render("account/login", {
      pageTitle: "Đăng nhập",
      errorMessage: "Tài khoản hoặc mật khẩu không đúng.",
    });
  }

  setAuthCookie(res, user);
  return res.redirect("/lecturer/question-bank");
};

module.exports.logout = (req, res) => {
  clearAuthCookie(res);
  return res.redirect("/");
};
