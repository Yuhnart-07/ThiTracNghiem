const router = require("express").Router();

const indexController = require("../../controllers/lecturer/index.controller");

const validate = require("../../middlewares/validate.middleware");
const questionBankValidator = require("../../validators/lecturer/question-bank.validator");
const examRegistrationValidator = require("../../validators/admin/exam-registration.validator");

// Question Bank
router.get('/question-bank', indexController.questionBank);
router.get('/question-bank/subjects', indexController.getQuestionSubjects);
router.get('/question-bank/questions', indexController.getQuestionList);
router.post('/question-bank/questions', validate(questionBankValidator.createOrUpdate), indexController.createQuestion);
router.put('/question-bank/questions/:questionId', validate(questionBankValidator.createOrUpdate), indexController.updateQuestion);
router.delete('/question-bank/questions', indexController.deleteMultipleQuestions);
router.delete('/question-bank/questions/:questionId', indexController.deleteQuestion);

// Test Exam
router.get('/test-exam', indexController.testExam);
router.post('/test-exam/start', indexController.startTestExam);
router.get('/test-exam/take', indexController.takeTestExam);
router.post('/test-exam/save-answer', indexController.saveTestAnswer);
router.post('/test-exam/submit', indexController.submitTestExam);

// Grade Report
router.get('/grade-report', indexController.gradeReport);
router.get('/grade-report/report', indexController.getGradeReport);

// Student Exams
router.get('/student-exams', indexController.studentExams);
router.get('/student-exams/list', indexController.getStudentExamsList);
router.get('/student-exams/detail/:id', indexController.getStudentExamDetail);

// Exam Registration
router.get('/exam-registration', indexController.examRegistration);
router.get('/exam-registration/registrations', indexController.getExamRegistrations);
router.post('/exam-registration/check-questions', validate(examRegistrationValidator.checkQuestions), indexController.checkExamQuestions);
router.post('/exam-registration/registrations', validate(examRegistrationValidator.create), indexController.createExamRegistration);
router.delete('/exam-registration/registrations', indexController.deleteMultipleExamRegistrations);
router.put('/exam-registration/registrations/:maMonHoc/:maLop/:lan', validate(examRegistrationValidator.create), indexController.updateExamRegistration);
router.delete('/exam-registration/registrations/:maMonHoc/:maLop/:lan', indexController.deleteExamRegistration);

module.exports = router;
