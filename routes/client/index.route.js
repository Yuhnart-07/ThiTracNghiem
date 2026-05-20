const router = require("express").Router();

const homeRoutes = require("./home.route");
const examRoutes = require("./exam.route");

router.use('/', homeRoutes);
router.use('/thi', examRoutes);

module.exports = router;
