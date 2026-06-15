const router = require("express").Router();

const accountController = require("../../controllers/account/account.controller");

router.use('/', accountController.login);

module.exports = router;
