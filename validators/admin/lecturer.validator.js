const Joi = require("joi");

exports.create = Joi.object({
  maGiangVien: Joi.string().trim().max(10).required().messages({
    "string.empty": "Mã giảng viên không được để trống.",
    "any.required": "Mã giảng viên là bắt buộc.",
    "string.max": "Mã giảng viên tối đa 10 ký tự."
  }),
  ho: Joi.string().trim().max(50).required().messages({
    "string.empty": "Họ giảng viên không được để trống.",
    "any.required": "Họ giảng viên là bắt buộc.",
    "string.max": "Họ giảng viên tối đa 50 ký tự."
  }),
  ten: Joi.string().trim().max(10).required().messages({
    "string.empty": "Tên giảng viên không được để trống.",
    "any.required": "Tên giảng viên là bắt buộc.",
    "string.max": "Tên giảng viên tối đa 10 ký tự."
  }),
  sdt: Joi.string().trim().pattern(/^[0-9]{10,11}$/).required().messages({
    "string.empty": "Số điện thoại không được để trống.",
    "any.required": "Số điện thoại là bắt buộc.",
    "string.pattern.base": "Số điện thoại phải từ 10-11 chữ số."
  }),
  diaChi: Joi.string().trim().max(200).required().messages({
    "string.empty": "Địa chỉ không được để trống.",
    "any.required": "Địa chỉ là bắt buộc.",
    "string.max": "Địa chỉ tối đa 200 ký tự."
  })
});

exports.update = Joi.object({
  ho: Joi.string().trim().max(50).required().messages({
    "string.empty": "Họ giảng viên không được để trống.",
    "any.required": "Họ giảng viên là bắt buộc.",
    "string.max": "Họ giảng viên tối đa 50 ký tự."
  }),
  ten: Joi.string().trim().max(10).required().messages({
    "string.empty": "Tên giảng viên không được để trống.",
    "any.required": "Tên giảng viên là bắt buộc.",
    "string.max": "Tên giảng viên tối đa 10 ký tự."
  }),
  sdt: Joi.string().trim().pattern(/^[0-9]{10,11}$/).required().messages({
    "string.empty": "Số điện thoại không được để trống.",
    "any.required": "Số điện thoại là bắt buộc.",
    "string.pattern.base": "Số điện thoại phải từ 10-11 chữ số."
  }),
  diaChi: Joi.string().trim().max(200).required().messages({
    "string.empty": "Địa chỉ không được để trống.",
    "any.required": "Địa chỉ là bắt buộc.",
    "string.max": "Địa chỉ tối đa 200 ký tự."
  })
});
