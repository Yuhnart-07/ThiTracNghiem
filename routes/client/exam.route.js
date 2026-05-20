const router = require("express").Router();
const examController = require("../../controllers/client/exam.controller");

router.get("/", examController.start);
router.get("/ket-qua", examController.result);

module.exports = router;
