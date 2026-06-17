const router = require("express").Router();

const indexController = require("../../controllers/lecturer/index.controller")


router.get('/question-bank', indexController.questionBank);
router.get('/question-bank/subjects', indexController.getQuestionSubjects);
router.get('/question-bank/questions', indexController.getQuestionList);
router.post('/question-bank/questions', indexController.createQuestion);
router.put('/question-bank/questions/:questionId', indexController.updateQuestion);
router.delete('/question-bank/questions/:questionId', indexController.deleteQuestion);
router.get('/test-exam', indexController.testExam);

module.exports = router;
