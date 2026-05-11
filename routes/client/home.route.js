const router = require("express").Router();

const homeController = require("../../controllers/client/home.controller.js")

router.get('/', homeController.home);


module.exports = router;