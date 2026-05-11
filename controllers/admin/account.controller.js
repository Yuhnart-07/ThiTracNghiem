module.exports.login =  (req, res) => {
  res.render('admin/pages/login', {
    pageTitle: "Đăng nhập"
  }) 
};

module.exports.register =  (req, res) => {
  res.render('admin/pages/register', {
    pageTitle: "Đăng ký"
  }) 
};

module.exports.forgetPassword =  (req, res) => {
  res.render('admin/pages/forget-password', {
    pageTitle: "Quên mật khẩu"
  }) 
};

module.exports.otpPassword =  (req, res) => {
  res.render('admin/pages/otp-password', {
    pageTitle: "Nhập mã OTP"
  }) 
};