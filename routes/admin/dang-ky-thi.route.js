const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("dang-ky-thi"));
router.get("/create", moduleController.create("dang-ky-thi"));

module.exports = router;
