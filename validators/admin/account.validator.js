const Joi = require("joi");

exports.create = Joi.object({
  username: Joi.string().trim().alphanum().min(3).max(50).required().messages({
    "string.empty": "Tài khoản không được để trống.",
    "any.required": "Tài khoản là bắt buộc.",
    "string.min": "Tài khoản tối thiểu 3 ký tự.",
    "string.max": "Tài khoản tối đa 50 ký tự.",
    "string.alphanum": "Tài khoản chỉ được chứa chữ cái và số."
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Mật khẩu không được để trống.",
    "any.required": "Mật khẩu là bắt buộc.",
    "string.min": "Mật khẩu tối thiểu 6 ký tự.",
    "string.max": "Mật khẩu tối đa 100 ký tự."
  }),
  role: Joi.string().valid("PGV", "GIANGVIEN").required().messages({
    "any.only": "Nhóm quyền không hợp lệ.",
    "any.required": "Nhóm quyền là bắt buộc."
  }),
  maGiangVien: Joi.string().trim().max(10).required().messages({
    "string.empty": "Giảng viên là bắt buộc.",
    "any.required": "Giảng viên là bắt buộc."
  })
});

exports.update = Joi.object({
  password: Joi.string().min(6).max(100).optional().allow("", null).messages({
    "string.min": "Mật khẩu mới tối thiểu 6 ký tự.",
    "string.max": "Mật khẩu mới tối đa 100 ký tự."
  }),
  role: Joi.string().valid("PGV", "GIANGVIEN").required().messages({
    "any.only": "Nhóm quyền không hợp lệ.",
    "any.required": "Nhóm quyền là bắt buộc."
  })
});
