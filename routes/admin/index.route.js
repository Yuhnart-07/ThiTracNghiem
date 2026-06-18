const express = require("express");
const router = express.Router();

const subjectManagementController = require("../../controllers/admin/subject-management.controller");
const classManagementController = require("../../controllers/admin/class-management.controller");
const lecturerManagementController = require("../../controllers/admin/lecturer-management.controller");
const examRegistrationController = require("../../controllers/admin/exam-registration.controller");
const gradeReportController = require("../../controllers/admin/grade-report.controller");
const accountCreateController = require("../../controllers/admin/account-create.controller");

router.get("/subject-management", subjectManagementController.list);
router.get("/class-management", classManagementController.list);
router.get("/lecturer-management", lecturerManagementController.list);
router.get("/exam-registration", examRegistrationController.page);
router.get("/exam-registration/registrations", examRegistrationController.list);
router.get("/grade-report", gradeReportController.list);
router.get("/account-create", accountCreateController.form);

module.exports = router;
