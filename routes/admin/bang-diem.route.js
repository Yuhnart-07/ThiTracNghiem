const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("bang-diem"));

module.exports = router;
