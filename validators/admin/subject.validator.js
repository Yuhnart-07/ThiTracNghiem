const Joi = require("joi");

exports.create = Joi.object({
  maMonHoc: Joi.string().trim().max(10).required().messages({
    "string.empty": "Mã môn học không được để trống.",
    "any.required": "Mã môn học là bắt buộc.",
    "string.max": "Mã môn học tối đa 10 ký tự."
  }),
  tenMonHoc: Joi.string().trim().max(100).required().messages({
    "string.empty": "Tên môn học không được để trống.",
    "any.required": "Tên môn học là bắt buộc.",
    "string.max": "Tên môn học tối đa 100 ký tự."
  })
});

exports.update = Joi.object({
  tenMonHoc: Joi.string().trim().max(100).required().messages({
    "string.empty": "Tên môn học không được để trống.",
    "any.required": "Tên môn học là bắt buộc.",
    "string.max": "Tên môn học tối đa 100 ký tự."
  })
});
