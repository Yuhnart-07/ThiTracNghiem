const router = require("express").Router();
const moduleController = require("../../controllers/admin/module.controller");

router.get("/list", moduleController.list("bo-de"));
router.get("/create", moduleController.create("bo-de"));

module.exports = router;
