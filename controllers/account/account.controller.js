const accountRepository = require("../../repositories/account/account.repository");
const { clearAuthCookie, setAuthCookie } = require("../../configs/auth.config");
const { pathAdmin } = require("../../configs/variable.config");

module.exports.login = (req, res) => {
  res.render("account/login", {
    pageTitle: "Đăng nhập",
    errorMessage: null,
  });
};

module.exports.loginSubmit = async (req, res) => {
  const role = req.body.role;

  if (role === "student") {
    const student_id = req.body.student_id?.trim();
    if (!student_id) {
      return res.status(400).render("account/login", {
        pageTitle: "Đăng nhập",
        errorMessage: "Vui lòng nhập mã sinh viên.",
        role,
        student_id,
      });
    }

    const user = await accountRepository.loginStudent({ masv: student_id });
    if (!user) {
      return res.status(401).render("account/login", {
        pageTitle: "Đăng nhập",
        errorMessage: "Mã sinh viên không đúng hoặc không tồn tại.",
        role,
        student_id,
      });
    }

    setAuthCookie(res, user);
    return res.redirect("/client/exam");
  } else {
    // Lecturer / PGV login
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!username || !password) {
      return res.status(400).render("account/login", {
        pageTitle: "Đăng nhập",
        errorMessage: "Vui lòng nhập tài khoản và mật khẩu.",
        role,
        username,
      });
    }

    const user = await accountRepository.loginLecturerAdmin({ username, password });

    if (!user) {
      return res.status(401).render("account/login", {
        pageTitle: "Đăng nhập",
        errorMessage: "Tài khoản hoặc mật khẩu không đúng.",
        role,
        username,
      });
    }

    setAuthCookie(res, user);

    // Redirect based on role
    const normalizedRole = String(user.ROLE || user.role || "").toUpperCase();
    if (normalizedRole === "PGV") {
      return res.redirect(`/${pathAdmin}/subject-management`);
    } else {
      return res.redirect("/lecturer/question-bank");
    }
  }
};

module.exports.logout = (req, res) => {
  clearAuthCookie(res);
  return res.redirect("/");
};

