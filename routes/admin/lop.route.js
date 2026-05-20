const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("lop"));
router.get("/create", moduleController.create("lop"));
router.get("/detail", moduleController.detail("lop"));

module.exports = router;
