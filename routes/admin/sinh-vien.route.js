const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("sinh-vien"));
router.get("/create", moduleController.create("sinh-vien"));

module.exports = router;
