const router = require("express").Router();
const examController = require("../../controllers/client/exam.controller");

router.get("/exam", examController.exam);
router.get("/exam-review", examController.examReview);

module.exports = router;
