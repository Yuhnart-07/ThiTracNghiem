const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("giao-vien"));
router.get("/create", moduleController.create("giao-vien"));
router.get("/detail", moduleController.detail("giao-vien"));

module.exports = router;
