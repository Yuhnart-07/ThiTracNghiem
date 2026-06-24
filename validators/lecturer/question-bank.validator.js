const Joi = require("joi");

exports.createOrUpdate = Joi.object({
  maMonHoc: Joi.string().trim().max(5).required().messages({
    "string.empty": "Môn học không được rỗng.",
    "string.max": "Mã môn học vượt quá độ dài tối đa 5 ký tự.",
    "any.required": "Môn học là bắt buộc."
  }),
  trinhDo: Joi.string().trim().valid("A", "B", "C").required().messages({
    "any.only": "Trình độ chỉ được là A, B hoặc C.",
    "any.required": "Trình độ là bắt buộc."
  }),
  noiDung: Joi.string().trim().max(500).required().messages({
    "string.empty": "Nội dung câu hỏi không được rỗng.",
    "string.max": "Nội dung câu hỏi vượt quá 500 ký tự.",
    "any.required": "Nội dung câu hỏi là bắt buộc."
  }),
  A: Joi.string().trim().max(200).required().messages({
    "string.empty": "Đáp án A không được rỗng.",
    "string.max": "Đáp án A vượt quá 200 ký tự.",
    "any.required": "Đáp án A là bắt buộc."
  }),
  B: Joi.string().trim().max(200).required().messages({
    "string.empty": "Đáp án B không được rỗng.",
    "string.max": "Đáp án B vượt quá 200 ký tự.",
    "any.required": "Đáp án B là bắt buộc."
  }),
  C: Joi.string().trim().max(200).required().messages({
    "string.empty": "Đáp án C không được rỗng.",
    "string.max": "Đáp án C vượt quá 200 ký tự.",
    "any.required": "Đáp án C là bắt buộc."
  }),
  D: Joi.string().trim().max(200).required().messages({
    "string.empty": "Đáp án D không được rỗng.",
    "string.max": "Đáp án D vượt quá 200 ký tự.",
    "any.required": "Đáp án D là bắt buộc."
  }),
  dapAn: Joi.string().trim().valid("A", "B", "C", "D").required().messages({
    "any.only": "Đáp án đúng chỉ được là A, B, C hoặc D.",
    "any.required": "Đáp án đúng là bắt buộc."
  })
}).custom((value, helpers) => {
  const answers = [
    ["A", value.A.trim().replace(/\s+/g, " ").toLowerCase()],
    ["B", value.B.trim().replace(/\s+/g, " ").toLowerCase()],
    ["C", value.C.trim().replace(/\s+/g, " ").toLowerCase()],
    ["D", value.D.trim().replace(/\s+/g, " ").toLowerCase()]
  ];
  const seen = new Map();
  for (const [label, answer] of answers) {
    if (seen.has(answer)) {
      return helpers.message(`Đáp án ${seen.get(answer)} và ${label} không được trùng nhau.`);
    }
    seen.set(answer, label);
  }
  return value;
});
