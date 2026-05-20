const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("mon-hoc"));
router.get("/create", moduleController.create("mon-hoc"));
router.get("/detail", moduleController.detail("mon-hoc"));

module.exports = router;
