const questionBankRepository = require("../../repositories/lecturer/question-bank.repository");

class QuestionBankError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "QuestionBankError";
    this.statusCode = statusCode;
  }
}

const ROLE = {
  GIANGVIEN: "GIANGVIEN",
  PGV: "PGV",
  SINHVIEN: "SINHVIEN",
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeAnswerForCompare = (value) => normalizeText(value).replace(/\s+/g, " ").toLowerCase();

const normalizeUser = (user) => {
  if (!user) return null;

  const role = normalizeText(user.role || user.ROLE).toUpperCase();
  const maGiangVien = normalizeText(user.maGiangVien || user.magv || user.MAGV);

  return {
    ...user,
    role,
    maGiangVien,
  };
};

const assertCanViewQuestions = (currentUser) => {
  const user = normalizeUser(currentUser);

  if (!user) {
    throw new QuestionBankError("Chưa xác định được tài khoản đang đăng nhập.", 401);
  }

  if (user.role === ROLE.SINHVIEN) {
    throw new QuestionBankError("Sinh viên không được truy cập module nhập câu hỏi thi.", 403);
  }

  if (![ROLE.GIANGVIEN, ROLE.PGV].includes(user.role)) {
    throw new QuestionBankError("Tài khoản không có quyền truy cập module nhập câu hỏi thi.", 403);
  }

  if (user.role === ROLE.GIANGVIEN && !user.maGiangVien) {
    throw new QuestionBankError("Tài khoản giảng viên chưa có mã giảng viên.", 403);
  }

  return user;
};

const assertCanMutateQuestions = (currentUser) => {
  const user = assertCanViewQuestions(currentUser);

  if (user.role !== ROLE.GIANGVIEN) {
    throw new QuestionBankError("PGV chỉ được xem danh sách câu hỏi, không được thêm, sửa hoặc xóa.", 403);
  }

  return user;
};

const getFirstValue = (body, keys) => {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }

  return undefined;
};

const rejectIdentityFieldsFromBody = (body, { rejectQuestionId }) => {
  const forbiddenTeacherFields = ["MAGV", "magv", "maGiangVien", "lecturerCode"];
  const forbiddenQuestionFields = ["CAUHOI", "cauHoi", "questionId"];

  if (forbiddenTeacherFields.some((field) => body[field] !== undefined)) {
    throw new QuestionBankError("Không được gửi MAGV từ form. MAGV phải lấy từ tài khoản đăng nhập.", 400);
  }

  if (rejectQuestionId && forbiddenQuestionFields.some((field) => body[field] !== undefined)) {
    throw new QuestionBankError("Không được gửi CAUHOI từ form. Mã câu hỏi phải đi qua route hoặc do database tự sinh.", 400);
  }
};

const buildQuestionPayload = (body, maGiangVien) => {
  const payload = {
    maMonHoc: normalizeText(getFirstValue(body, ["maMonHoc", "MAMH", "subject"])),
    trinhDo: normalizeText(getFirstValue(body, ["trinhDo", "TRINHDO", "level"])).toUpperCase(),
    noiDung: normalizeText(getFirstValue(body, ["noiDung", "NOIDUNG", "questionContent"])),
    dapAnA: normalizeText(getFirstValue(body, ["dapAnA", "A", "answerA"])),
    dapAnB: normalizeText(getFirstValue(body, ["dapAnB", "B", "answerB"])),
    dapAnC: normalizeText(getFirstValue(body, ["dapAnC", "C", "answerC"])),
    dapAnD: normalizeText(getFirstValue(body, ["dapAnD", "D", "answerD"])),
    dapAnDung: normalizeText(getFirstValue(body, ["dapAnDung", "DAP_AN", "correctAnswer"])).toUpperCase(),
    maGiangVien,
  };

  return payload;
};

const validateQuestionPayload = (payload) => {
  const requiredFields = [
    ["maMonHoc", "Môn học không được rỗng."],
    ["trinhDo", "Trình độ không được rỗng."],
    ["noiDung", "Nội dung câu hỏi không được rỗng."],
    ["dapAnA", "Đáp án A không được rỗng."],
    ["dapAnB", "Đáp án B không được rỗng."],
    ["dapAnC", "Đáp án C không được rỗng."],
    ["dapAnD", "Đáp án D không được rỗng."],
    ["dapAnDung", "Đáp án đúng không được rỗng."],
  ];

  for (const [field, message] of requiredFields) {
    if (!payload[field]) {
      throw new QuestionBankError(message, 400);
    }
  }

  if (payload.maMonHoc.length > 5) {
    throw new QuestionBankError("Mã môn học vượt quá độ dài cột BODE.MAMH.", 400);
  }

  if (!["A", "B", "C"].includes(payload.trinhDo)) {
    throw new QuestionBankError("Trình độ chỉ được là A, B hoặc C.", 400);
  }

  if (payload.noiDung.length > 500) {
    throw new QuestionBankError("Nội dung câu hỏi vượt quá 500 ký tự.", 400);
  }

  const answerFields = ["dapAnA", "dapAnB", "dapAnC", "dapAnD"];
  if (answerFields.some((field) => payload[field].length > 200)) {
    throw new QuestionBankError("Đáp án vượt quá 200 ký tự.", 400);
  }

  if (!["A", "B", "C", "D"].includes(payload.dapAnDung)) {
    throw new QuestionBankError("Đáp án đúng chỉ được là A, B, C hoặc D.", 400);
  }

  const answers = [
    ["A", payload.dapAnA],
    ["B", payload.dapAnB],
    ["C", payload.dapAnC],
    ["D", payload.dapAnD],
  ];
  const seenAnswers = new Map();

  for (const [label, answer] of answers) {
    const normalizedAnswer = normalizeAnswerForCompare(answer);

    if (seenAnswers.has(normalizedAnswer)) {
      throw new QuestionBankError(`Đáp án ${seenAnswers.get(normalizedAnswer)} và ${label} không được trùng nhau.`, 400);
    }

    seenAnswers.set(normalizedAnswer, label);
  }
};

const validateQuestionId = (questionId) => {
  const parsedQuestionId = Number(questionId);

  if (!Number.isInteger(parsedQuestionId) || parsedQuestionId <= 0) {
    throw new QuestionBankError("Mã câu hỏi không hợp lệ.", 400);
  }

  return parsedQuestionId;
};

const assertQuestionBelongsToTeacher = (question, maGiangVien) => {
  if (!question) {
    throw new QuestionBankError("Câu hỏi không tồn tại.", 404);
  }

  if (question.maGiangVien !== maGiangVien) {
    throw new QuestionBankError("Không được sửa hoặc xóa câu hỏi của giảng viên khác.", 403);
  }
};

const assertQuestionCanBeChanged = async (questionId, maGiangVien) => {
  const question = await questionBankRepository.getQuestionById(questionId);

  // Bước kiểm tra quyền sở hữu nằm ở service để repository chỉ làm nhiệm vụ truy vấn dữ liệu.
  assertQuestionBelongsToTeacher(question, maGiangVien);

  const usedInExamDetail = await questionBankRepository.checkQuestionUsedInExamDetail(questionId);
  if (usedInExamDetail) {
    throw new QuestionBankError("Câu hỏi đã xuất hiện trong BAITHI_CHITIET nên không được sửa hoặc xóa.", 409);
  }
};

const assertReferenceDataExists = async (payload) => {
  const [subjectExists, teacherExists] = await Promise.all([
    questionBankRepository.checkSubjectExists(payload.maMonHoc),
    questionBankRepository.checkTeacherExists(payload.maGiangVien),
  ]);

  if (!subjectExists) {
    throw new QuestionBankError("Môn học không tồn tại trong bảng MONHOC.", 400);
  }

  if (!teacherExists) {
    throw new QuestionBankError("Mã giảng viên không tồn tại trong bảng GIAOVIEN.", 400);
  }
};

const getQuestionBankPageData = async (currentUser) => {
  const user = assertCanViewQuestions(currentUser);
  const subjects = await questionBankRepository.getSubjects();

  return {
    user,
    subjects,
  };
};

const getSubjects = async (currentUser) => {
  assertCanViewQuestions(currentUser);
  return questionBankRepository.getSubjects();
};

const getQuestions = async (currentUser, filters = {}) => {
  const user = assertCanViewQuestions(currentUser);
  const maMonHoc = normalizeText(filters.maMonHoc || filters.MAMH || filters.subject);
  const trinhDo = normalizeText(filters.trinhDo || filters.TRINHDO || filters.level).toUpperCase();
  const keyword = normalizeText(filters.keyword || filters.q);

  if (trinhDo && !["A", "B", "C"].includes(trinhDo)) {
    throw new QuestionBankError("Trình độ lọc chỉ được là A, B hoặc C.", 400);
  }

  return questionBankRepository.getQuestions({
    maGiangVien: user.role === ROLE.GIANGVIEN ? user.maGiangVien : null,
    maMonHoc: maMonHoc || null,
    trinhDo: trinhDo || null,
    keyword: keyword || null,
  });
};

const createQuestion = async (currentUser, body) => {
  const user = assertCanMutateQuestions(currentUser);

  // Bước này chặn giả mạo MAGV/CAUHOI từ form trước khi gom dữ liệu nghiệp vụ.
  rejectIdentityFieldsFromBody(body, { rejectQuestionId: true });

  const payload = buildQuestionPayload(body, user.maGiangVien);
  validateQuestionPayload(payload);
  await assertReferenceDataExists(payload);

  // Database tự cấp CAUHOI liên tục bên trong sp_ThemCauHoi.
  return questionBankRepository.createQuestion(payload);
};

const updateOwnQuestion = async (currentUser, questionId, body) => {
  const user = assertCanMutateQuestions(currentUser);
  const parsedQuestionId = validateQuestionId(questionId);

  rejectIdentityFieldsFromBody(body, { rejectQuestionId: true });
  const payload = buildQuestionPayload(body, user.maGiangVien);
  validateQuestionPayload(payload);
  await assertReferenceDataExists(payload);
  await assertQuestionCanBeChanged(parsedQuestionId, user.maGiangVien);

  return questionBankRepository.updateQuestion(parsedQuestionId, payload);
};

const deleteOwnQuestionIfUnused = async (currentUser, questionId) => {
  const user = assertCanMutateQuestions(currentUser);
  const parsedQuestionId = validateQuestionId(questionId);

  await assertQuestionCanBeChanged(parsedQuestionId, user.maGiangVien);
  return questionBankRepository.deleteQuestion(parsedQuestionId, user.maGiangVien);
};

const deleteMultipleOwnQuestions = async (currentUser, idsString) => {
  const user = assertCanMutateQuestions(currentUser);
  if (!idsString) {
    throw new QuestionBankError("Danh sách câu hỏi cần xóa không hợp lệ.", 400);
  }
  
  const ids = idsString.split(",").map(id => validateQuestionId(id.trim()));
  for (const id of ids) {
    await assertQuestionCanBeChanged(id, user.maGiangVien);
  }
  
  return questionBankRepository.deleteMultipleQuestions(ids.join(","), user.maGiangVien);
};

module.exports = {
  QuestionBankError,
  getQuestionBankPageData,
  getSubjects,
  getQuestions,
  createQuestion,
  updateOwnQuestion,
  deleteOwnQuestionIfUnused,
  deleteMultipleOwnQuestions,
};
