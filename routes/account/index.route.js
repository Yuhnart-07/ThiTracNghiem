const router = require("express").Router();

const accountController = require("../../controllers/account/account.controller");

router.get("/", accountController.login);
router.post("/login", accountController.loginSubmit);
router.get("/logout", accountController.logout);

module.exports = router;
