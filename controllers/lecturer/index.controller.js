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

module.exports.testExam =  (req, res) => {
  res.render('lecturer/pages/test-exam', {
    pageTitle: "Thi thử"
  }) 
};
