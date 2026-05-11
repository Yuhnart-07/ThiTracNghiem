const router = require("express").Router();

const accountController = require("../../controllers/admin/account.controller");

router.get('/login', accountController.login );
router.get('/register', accountController.register );
router.get('/forget-password', accountController.forgetPassword );
router.get('/otp-password', accountController.otpPassword);

module.exports = router;