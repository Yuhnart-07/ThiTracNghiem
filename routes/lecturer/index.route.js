const router = require("express").Router();

const indexController = require("../../controllers/lecturer/index.controller")


router.get('/question-bank', indexController.questionBank);
router.get('/question-bank/subjects', indexController.getQuestionSubjects);
router.get('/question-bank/questions', indexController.getQuestionList);
router.post('/question-bank/questions', indexController.createQuestion);
router.put('/question-bank/questions/:questionId', indexController.updateQuestion);
router.delete('/question-bank/questions/:questionId', indexController.deleteQuestion);
router.get('/test-exam', indexController.testExam);
router.get('/exam-registration', indexController.examRegistration);
router.get('/exam-registration/registrations', indexController.getExamRegistrations);
router.post('/exam-registration/check-questions', indexController.checkExamQuestions);
router.post('/exam-registration/registrations', indexController.createExamRegistration);
router.put('/exam-registration/registrations/:maMonHoc/:maLop/:lan', indexController.updateExamRegistration);
router.delete('/exam-registration/registrations/:maMonHoc/:maLop/:lan', indexController.deleteExamRegistration);

module.exports = router;
