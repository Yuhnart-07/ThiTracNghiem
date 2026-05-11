const AccountAdmin = require("../../models/account-admin.model.js");


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


module.exports.registerPost = async (req, res) => {
  const existEmail = await AccountAdmin.findOne({
    email: req.body.email
  })

  if(existEmail) {
    res.json({
      code: "error",
      message: "Email đa tồn tại trong hệ thống!"
    })
    return;
  }
  req.body.status = "initial"

  const newAccount = new AccountAdmin(req.body);
  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công!"
  })
};

module.exports.registerSuccess =  (req, res) => {
  res.render('admin/pages/register-success', {
    pageTitle: "Đăng ký thành công"
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