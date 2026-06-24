const Joi = require("joi");

exports.create = Joi.object({
  maLop: Joi.string().trim().required().messages({
    "string.empty": "Mã lớp không được để trống.",
    "any.required": "Mã lớp là bắt buộc."
  }),
  maMonHoc: Joi.string().trim().required().messages({
    "string.empty": "Mã môn học không được để trống.",
    "any.required": "Mã môn học là bắt buộc."
  }),
  trinhDo: Joi.string().trim().valid("A", "B", "C").required().messages({
    "any.only": "Trình độ chỉ được là A, B hoặc C.",
    "any.required": "Trình độ là bắt buộc."
  }),
  lan: Joi.number().integer().min(1).max(2).required().messages({
    "number.base": "Lần thi phải là số.",
    "number.min": "Lần thi chỉ có thể là 1 hoặc 2.",
    "number.max": "Lần thi chỉ có thể là 1 hoặc 2.",
    "any.required": "Lần thi là bắt buộc."
  }),
  soCauThi: Joi.number().integer().min(10).max(100).required().messages({
    "number.base": "Số câu thi phải là số.",
    "number.min": "Số câu thi phải từ 10 đến 100.",
    "number.max": "Số câu thi phải từ 10 đến 100.",
    "any.required": "Số câu thi là bắt buộc."
  }),
  ngayThi: Joi.date().greater("now").required().messages({
    "date.base": "Ngày giờ thi không hợp lệ.",
    "date.greater": "Ngày giờ thi phải nằm trong tương lai.",
    "any.required": "Ngày giờ thi là bắt buộc."
  }),
  thoiGian: Joi.number().integer().min(5).max(60).required().messages({
    "number.base": "Thời gian thi phải là số.",
    "number.min": "Thời gian thi phải từ 5 đến 60 phút.",
    "number.max": "Thời gian thi phải từ 5 đến 60 phút.",
    "any.required": "Thời gian thi là bắt buộc."
  })
});

exports.checkQuestions = Joi.object({
  maMonHoc: Joi.string().trim().required().messages({
    "string.empty": "Vui lòng chọn môn học."
  }),
  trinhDo: Joi.string().trim().valid("A", "B", "C").required().messages({
    "any.only": "Vui lòng chọn trình độ hợp lệ."
  }),
  soCauThi: Joi.number().integer().min(10).max(100).required().messages({
    "number.min": "Số câu thi phải từ 10 đến 100.",
    "number.max": "Số câu thi phải từ 10 đến 100."
  })
});
