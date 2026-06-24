const Joi = require("joi");

exports.createClass = Joi.object({
  maLop: Joi.string().trim().max(20).required().messages({
    "string.empty": "Mã lớp không được để trống.",
    "any.required": "Mã lớp là bắt buộc.",
    "string.max": "Mã lớp tối đa 20 ký tự."
  }),
  tenLop: Joi.string().trim().max(100).required().messages({
    "string.empty": "Tên lớp không được để trống.",
    "any.required": "Tên lớp là bắt buộc.",
    "string.max": "Tên lớp tối đa 100 ký tự."
  })
});

exports.updateClass = Joi.object({
  tenLop: Joi.string().trim().max(100).required().messages({
    "string.empty": "Tên lớp không được để trống.",
    "any.required": "Tên lớp là bắt buộc.",
    "string.max": "Tên lớp tối đa 100 ký tự."
  })
});

exports.createStudent = Joi.object({
  maSinhVien: Joi.string().trim().max(8).required().messages({
    "string.empty": "Mã sinh viên không được để trống.",
    "any.required": "Mã sinh viên là bắt buộc.",
    "string.max": "Mã sinh viên tối đa 8 ký tự."
  }),
  ho: Joi.string().trim().max(50).required().messages({
    "string.empty": "Họ sinh viên không được để trống.",
    "any.required": "Họ sinh viên là bắt buộc.",
    "string.max": "Họ sinh viên tối đa 50 ký tự."
  }),
  ten: Joi.string().trim().max(10).required().messages({
    "string.empty": "Tên sinh viên không được để trống.",
    "any.required": "Tên sinh viên là bắt buộc.",
    "string.max": "Tên sinh viên tối đa 10 ký tự."
  }),
  ngaySinh: Joi.string().isoDate().optional().allow("", null).messages({
    "string.isoDate": "Ngày sinh không đúng định dạng ISO (YYYY-MM-DD)."
  }),
  diaChi: Joi.string().trim().max(200).optional().allow("", null).messages({
    "string.max": "Địa chỉ tối đa 200 ký tự."
  }),
  maLop: Joi.string().trim().max(20).required().messages({
    "string.empty": "Mã lớp của sinh viên không được để trống.",
    "any.required": "Mã lớp là bắt buộc."
  })
});

exports.updateStudent = Joi.object({
  ho: Joi.string().trim().max(50).required().messages({
    "string.empty": "Họ sinh viên không được để trống.",
    "any.required": "Họ sinh viên là bắt buộc.",
    "string.max": "Họ sinh viên tối đa 50 ký tự."
  }),
  ten: Joi.string().trim().max(10).required().messages({
    "string.empty": "Tên sinh viên không được để trống.",
    "any.required": "Tên sinh viên là bắt buộc.",
    "string.max": "Tên sinh viên tối đa 10 ký tự."
  }),
  ngaySinh: Joi.string().isoDate().optional().allow("", null).messages({
    "string.isoDate": "Ngày sinh không đúng định dạng ISO (YYYY-MM-DD)."
  }),
  diaChi: Joi.string().trim().max(200).optional().allow("", null).messages({
    "string.max": "Địa chỉ tối đa 200 ký tự."
  })
});
