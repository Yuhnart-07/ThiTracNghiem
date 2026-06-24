const questionBankService = require("../../services/lecturer/question-bank.service");
const examRegistrationService = require("../../services/lecturer/exam-registration.service");
const { getAuthUserFromRequest } = require("../../configs/auth.config");

const getCurrentUser = (req, res) =>
  req.user ||
  req.session?.user ||
  res.locals.currentUser ||
  res.locals.user ||
  getAuthUserFromRequest(req);

const sendQuestionBankError = (res, error) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Có lỗi xảy ra khi xử lý module nhập câu hỏi thi.",
  });
};

const sendExamRegistrationError = (res, error) => res.status(error.statusCode || 500).json({
  success: false,
  message: error.message || "Có lỗi xảy ra khi xử lý đăng ký thi.",
});

module.exports.examRegistration = async (req, res) => {
  try {
    const data = await examRegistrationService.getPageData(getCurrentUser(req, res));
    return res.render("lecturer/pages/exam-registration", { pageTitle: "Đăng ký thi", currentUser: data.user, classes: data.classes, subjects: data.subjects });
  } catch (error) { return res.status(error.statusCode || 500).send(error.message); }
};
module.exports.getExamRegistrations = async (req,res)=>{
  try{
    return res.json({success:true,data:await examRegistrationService.getRegistrations(getCurrentUser(req,res),req.query)});
  }catch(e){
    return sendExamRegistrationError(res,e);
  }};

module.exports.checkExamQuestions = async (req,res)=>{
  try{
    return res.json({success:true,data:await examRegistrationService.checkQuestions(getCurrentUser(req,res),req.body)});
  }catch(e){
    return sendExamRegistrationError(res,e);
  }};

module.exports.createExamRegistration = async (req,res)=>{
  try{const data=await examRegistrationService.create(getCurrentUser(req,res),req.body);
    return res.status(201).json({success:true,message:data?.ThongBao||"Đăng ký thi thành công."});
  }catch(e){
    return sendExamRegistrationError(res,e);
  }};

module.exports.updateExamRegistration = async (req,res)=>{
  try{const data=await examRegistrationService.update(getCurrentUser(req,res),req.params,req.body);
    return res.json({success:true,message:data?.ThongBao||"Cập nhật đăng ký thi thành công."});
  }catch(e){
    return sendExamRegistrationError(res,e);
  }};

module.exports.deleteExamRegistration = async (req,res)=>{
  try{const data=await examRegistrationService.remove(getCurrentUser(req,res),req.params);
    return res.json({success:true,message:data?.ThongBao||"Xóa đăng ký thi thành công."});
  }catch(e){
    return sendExamRegistrationError(res,e);
  }};

module.exports.questionBank = async (req, res) => {
  try {
    // Controller chỉ lấy user đang đăng nhập và chuyển xuống service để kiểm tra quyền module 4.5.
    const pageData = await questionBankService.getQuestionBankPageData(getCurrentUser(req, res));

    return res.render("lecturer/pages/question-bank", {
      pageTitle: "Quản lý câu hỏi thi",
      subjects: pageData.subjects,
      currentUser: pageData.user,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).send(error.message);
  }
};

module.exports.getQuestionSubjects = async (req, res) => {
  try {
    const subjects = await questionBankService.getSubjects(getCurrentUser(req, res));

    return res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.getQuestionList = async (req, res) => {
  try {
    const questions = await questionBankService.getQuestions(getCurrentUser(req, res), req.query);

    return res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.createQuestion = async (req, res) => {
  try {
    const result = await questionBankService.createQuestion(getCurrentUser(req, res), req.body);

    return res.status(201).json({
      success: true,
      message: result?.ThongBao || "Thêm câu hỏi thành công.",
      data: {
        cauHoi: result?.CAUHOI,
      },
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.updateQuestion = async (req, res) => {
  try {
    const result = await questionBankService.updateOwnQuestion(
      getCurrentUser(req, res),
      req.params.questionId,
      req.body,
    );

    return res.json({
      success: true,
      message: result?.ThongBao || "Sửa câu hỏi thành công.",
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.deleteQuestion = async (req, res) => {
  try {
    const result = await questionBankService.deleteOwnQuestionIfUnused(
      getCurrentUser(req, res),
      req.params.questionId,
    );

    return res.json({
      success: true,
      message: result?.ThongBao || "Xóa câu hỏi thành công.",
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.deleteMultipleQuestions = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await questionBankService.deleteMultipleOwnQuestions(
      getCurrentUser(req, res),
      ids
    );
    return res.json({
      success: true,
      message: result?.ThongBao || "Xóa các câu hỏi đã chọn thành công.",
    });
  } catch (error) {
    return sendQuestionBankError(res, error);
  }
};

module.exports.deleteMultipleExamRegistrations = async (req, res) => {
  try {
    const { items } = req.body;
    const result = await examRegistrationService.removeMultiple(
      getCurrentUser(req, res),
      items
    );
    return res.json({
      success: true,
      message: result?.ThongBao || "Xóa các lịch đăng ký thi đã chọn thành công.",
    });
  } catch (error) {
    return sendExamRegistrationError(res, error);
  }
};

module.exports.testExam = async (req, res) => {
  try {
    const { getPool } = require("../../configs/database.config");
    const pool = getPool();
    const result = await pool.request().query("SELECT MAMH, TENMH FROM MONHOC ORDER BY TENMH");
    res.render("lecturer/pages/test-exam", {
      pageTitle: "Thi thử",
      subjects: result.recordset,
    });
  } catch (e) {
    res.status(500).send("Có lỗi xảy ra: " + e.message);
  }
};

module.exports.startTestExam = async (req, res) => {
  try {
    const { getPool, sql } = require("../../configs/database.config");
    const { maMonHoc, trinhDo, soCauThi, thoiGian } = req.body;
    
    if (!maMonHoc || !trinhDo || !soCauThi || !thoiGian) {
      return res.status(400).send("Thiếu thông tin cấu hình đề thi thử.");
    }

    const pool = getPool();

    // 1. Lấy tên môn học
    const subjectRes = await pool
      .request()
      .input("MAMH", sql.NVarChar(50), maMonHoc)
      .query("SELECT TENMH FROM MONHOC WHERE MAMH = @MAMH");
    
    const subjectName = subjectRes.recordset[0]?.TENMH || maMonHoc;

    // 2. Lấy câu hỏi ngẫu nhiên từ BODE
    const limitCount = Number(soCauThi);
    let rawQuestions = [];

    if (trinhDo === "C") {
      const qRes = await pool
        .request()
        .input("MAMH", sql.NVarChar(50), maMonHoc)
        .input("LIMIT", sql.SmallInt, limitCount)
        .query(`
          SELECT TOP (@LIMIT) CAUHOI, NOIDUNG, A, B, C, D, DAP_AN 
          FROM BODE 
          WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = 'C' 
          ORDER BY NEWID()
        `);
      rawQuestions = qRes.recordset;
    } else {
      const soCauDung = Math.ceil(limitCount * 0.7);
      const soCauThap = limitCount - soCauDung;
      const trinhDoThap = trinhDo === "A" ? "B" : "C";

      const [qDungRes, qThapRes] = await Promise.all([
        pool
          .request()
          .input("MAMH", sql.NVarChar(50), maMonHoc)
          .input("TRINHDO", sql.Char(1), trinhDo)
          .input("LIMIT", sql.SmallInt, soCauDung)
          .query(`
            SELECT TOP (@LIMIT) CAUHOI, NOIDUNG, A, B, C, D, DAP_AN 
            FROM BODE 
            WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = @TRINHDO 
            ORDER BY NEWID()
          `),
        pool
          .request()
          .input("MAMH", sql.NVarChar(50), maMonHoc)
          .input("TRINHDO", sql.Char(1), trinhDoThap)
          .input("LIMIT", sql.SmallInt, soCauThap)
          .query(`
            SELECT TOP (@LIMIT) CAUHOI, NOIDUNG, A, B, C, D, DAP_AN 
            FROM BODE 
            WHERE RTRIM(MAMH) = RTRIM(@MAMH) AND TRINHDO = @TRINHDO 
            ORDER BY NEWID()
          `),
      ]);

      rawQuestions = [...qDungRes.recordset, ...qThapRes.recordset];
    }

    if (rawQuestions.length < limitCount) {
      return res.status(400).send(`Ngân hàng đề thi không đủ câu hỏi cho cấu hình thi thử (cần ${limitCount}, có ${rawQuestions.length})!`);
    }

    // Trộn ngẫu nhiên
    rawQuestions.sort(() => Math.random() - 0.5);

    // Format câu hỏi
    const questions = rawQuestions.map((row, idx) => ({
      stt: idx + 1,
      id: row.CAUHOI,
      noiDung: row.NOIDUNG,
      options: {
        A: row.A,
        B: row.B,
        C: row.C,
        D: row.D,
      },
    }));

    const info = {
      maMonHoc,
      tenMonHoc: subjectName,
      trinhDo,
      soCauThi: limitCount,
      thoiGian: Number(thoiGian),
    };

    res.json({
      success: true,
      questions,
      info,
    });
  } catch (e) {
    res.status(500).send("Có lỗi xảy ra khi tạo đề thi thử: " + e.message);
  }
};

module.exports.takeTestExam = (req, res) => {
  res.render("lecturer/pages/take-test", {
    pageTitle: "Phòng thi thử",
    currentUser: getCurrentUser(req, res),
  });
};

module.exports.saveTestAnswer = (req, res) => {
  res.json({ success: true });
};

module.exports.submitTestExam = async (req, res) => {
  try {
    const { getPool } = require("../../configs/database.config");
    const { questions, answers } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Thiếu danh sách câu hỏi." });
    }

    const qIds = questions.map(Number).filter((n) => !isNaN(n));
    if (!qIds.length) {
      return res.json({ success: true, correctCount: 0, score: 0, results: {} });
    }

    const pool = getPool();
    const result = await pool.request().query(`
      SELECT CAUHOI, DAP_AN FROM BODE WHERE CAUHOI IN (${qIds.join(",")})
    `);

    const records = result.recordset;
    let correctCount = 0;
    const results = {};

    for (const row of records) {
      const qId = row.CAUHOI;
      const correct = row.DAP_AN?.trim() || "";
      const selected = answers[qId]?.trim() || "";
      const isCorrect = selected === correct;
      if (isCorrect) {
        correctCount++;
      }
      results[qId] = {
        correct,
        selected,
        isCorrect,
      };
    }

    const score = Math.round((correctCount / qIds.length) * 10 * 10) / 10;

    res.json({
      success: true,
      correctCount,
      score,
      results,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.gradeReport = async (req, res) => {
  try {
    const classRepo = require("../../repositories/admin/class-management.repository");
    const subjectRepo = require("../../repositories/admin/subject-management.repository");
    const classes = await classRepo.getDanhSachLop();
    const subjects = await subjectRepo.getSubjects();
    res.render("lecturer/pages/grade-report", {
      pageTitle: "Bảng điểm môn học",
      classes,
      subjects,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

module.exports.getGradeReport = async (req, res) => {
  try {
    const gradeRepo = require("../../repositories/admin/grade-report.repository");
    const { maLop, maMonHoc, lanThi } = req.query;
    if (!maLop || !maMonHoc || !lanThi) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn đầy đủ Lớp, Môn học và Lần thi." });
    }
    const data = await gradeRepo.getGradeReport({ maLop, maMonHoc, lanThi });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.studentExams = async (req, res) => {
  try {
    const classRepo = require("../../repositories/admin/class-management.repository");
    const subjectRepo = require("../../repositories/admin/subject-management.repository");
    const classes = await classRepo.getDanhSachLop();
    const subjects = await subjectRepo.getSubjects();
    res.render("lecturer/pages/student-exams", {
      pageTitle: "Xem bài thi sinh viên",
      classes,
      subjects,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

module.exports.getStudentExamsList = async (req, res) => {
  try {
    const { getPool, sql } = require("../../configs/database.config");
    const { maLop, maMonHoc } = req.query;
    if (!maLop || !maMonHoc) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn Lớp và Môn học." });
    }
    const pool = getPool();
    const result = await pool.request()
      .input("MALOP", sql.NVarChar(50), maLop)
      .input("MAMH", sql.NVarChar(50), maMonHoc)
      .query(`
        SELECT b.ID, b.MASV, s.HO, s.TEN, b.LAN, b.NGAYTHI, b.DIEM, b.TRINHDO, b.SOCAUTHI, b.THOIGIAN
        FROM BAITHI b
        JOIN SINHVIEN s ON b.MASV = s.MASV
        WHERE s.MALOP = @MALOP AND b.MAMH = @MAMH
        ORDER BY b.NGAYTHI DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports.getStudentExamDetail = async (req, res) => {
  try {
    const { getPool, sql } = require("../../configs/database.config");
    const examId = req.params.id;
    const pool = getPool();
    const examHeader = await pool.request()
      .input("ID", sql.Int, examId)
      .query(`
        SELECT b.ID, b.MASV, s.HO, s.TEN, sv_lop.TENLOP, b.MAMH, m.TENMH, b.LAN, b.NGAYTHI, b.TRINHDO, b.SOCAUTHI, b.THOIGIAN, b.DIEM
        FROM BAITHI b
        JOIN SINHVIEN s ON b.MASV = s.MASV
        JOIN LOP sv_lop ON s.MALOP = sv_lop.MALOP
        JOIN MONHOC m ON b.MAMH = m.MAMH
        WHERE b.ID = @ID
      `);
    
    if (!examHeader.recordset[0]) {
      return res.status(404).send("Không tìm thấy bài thi.");
    }
    
    const examDetails = await pool.request()
      .input("BAITHI_ID", sql.Int, examId)
      .query(`
        SELECT bc.STT, bc.CAUHOI, bc.DAP_AN_CHON, bc.DUNG_SAI, q.NOIDUNG, q.A, q.B, q.C, q.D, q.DAP_AN
        FROM BAITHI_CHITIET bc
        JOIN BODE q ON bc.CAUHOI = q.CAUHOI
        WHERE bc.BAITHI_ID = @BAITHI_ID
        ORDER BY bc.STT
      `);
    
    res.render("lecturer/pages/student-exam-detail", {
      pageTitle: "Chi tiết bài làm sinh viên",
      exam: examHeader.recordset[0],
      questions: examDetails.recordset,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};
