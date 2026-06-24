const { pathAdmin, pathLecturer } = require("../configs/variable.config");

module.exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/");
  }
  next();
};

module.exports.requireRole = (allowedRoles) => (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (allowedRoles.includes(role)) {
    return next();
  }

  if (role === "SINHVIEN") {
    return res.redirect("/client/exam");
  }
  if (role === "PGV") {
    return res.redirect(`/${pathAdmin}/dashboard`);
  }
  if (role === "GIANGVIEN") {
    return res.redirect(`/${pathLecturer}/question-bank`);
  }

  return res.redirect("/");
};
