const router = require("express").Router();
const examController = require("../../controllers/client/exam.controller");

router.get("/exam", examController.exam);
router.post("/exam/start", examController.startExam);
router.get("/exam/take/:baithiId", examController.takeExam);
router.post("/exam/save-answer", examController.saveAnswer);
router.post("/exam/submit/:baithiId", examController.submitExam);
router.get("/exam/submit-auto/:baithiId", examController.submitAuto);

router.get("/exam-review", examController.examReview);
router.get("/exam-review/list", examController.getExamReviewList);
router.get("/exam-review/detail/:id", examController.getExamReviewDetail);

module.exports = router;
