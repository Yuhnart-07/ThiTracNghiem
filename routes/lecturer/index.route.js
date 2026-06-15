const router = require("express").Router();

const indexController = require("../../controllers/lecturer/index.controller")


router.get('/question-bank', indexController.questionBank);
router.get('/test-exam', indexController.testExam);

module.exports = router;
