const express = require("express");
const router = express.Router();

const subjectManagementController = require("../../controllers/admin/subject-management.controller");
const classManagementController = require("../../controllers/admin/class-management.controller");
const lecturerManagementController = require("../../controllers/admin/lecturer-management.controller");
const examRegistrationController = require("../../controllers/admin/exam-registration.controller");
const gradeReportController = require("../../controllers/admin/grade-report.controller");
const accountCreateController = require("../../controllers/admin/account-create.controller");
const dashboardController = require("../../controllers/admin/dashboard.controller");

const validate = require("../../middlewares/validate.middleware");
const subjectValidator = require("../../validators/admin/subject.validator");
const classValidator = require("../../validators/admin/class.validator");
const lecturerValidator = require("../../validators/admin/lecturer.validator");
const accountValidator = require("../../validators/admin/account.validator");
const examRegistrationValidator = require("../../validators/admin/exam-registration.validator");

// Dashboard
router.get("/dashboard", dashboardController.index);

// Môn học
router.get("/subject-management", subjectManagementController.list);
router.get("/subject-management/subjects", subjectManagementController.getSubjects);
router.post("/subject-management/subjects", validate(subjectValidator.create), subjectManagementController.createSubject);
router.put("/subject-management/subjects/:mamh", validate(subjectValidator.update), subjectManagementController.updateSubject);
router.delete("/subject-management/subjects", subjectManagementController.deleteMultipleSubjects);
router.delete("/subject-management/subjects/:mamh", subjectManagementController.deleteSubject);

// Lớp học & Sinh viên
router.get("/class-management", classManagementController.list);
router.get("/class-management/classes", classManagementController.getClasses);
router.post("/class-management/classes", validate(classValidator.createClass), classManagementController.addClass);
router.put("/class-management/classes/:malop", validate(classValidator.updateClass), classManagementController.updateClass);
router.delete("/class-management/classes", classManagementController.deleteClasses);
router.delete("/class-management/classes/:malop", classManagementController.deleteClass);

router.get("/class-management/students", classManagementController.getStudentsByClass);
router.post("/class-management/students", validate(classValidator.createStudent), classManagementController.addStudent);
router.put("/class-management/students/:masv", validate(classValidator.updateStudent), classManagementController.updateStudent);
router.delete("/class-management/students", classManagementController.deleteStudents);
router.delete("/class-management/students/:masv", classManagementController.deleteStudent);

// Giảng viên
router.get("/lecturer-management", lecturerManagementController.list);
router.get("/lecturer-management/lecturers", lecturerManagementController.getLecturers);
router.post("/lecturer-management/lecturers", validate(lecturerValidator.create), lecturerManagementController.createLecturer);
router.put("/lecturer-management/lecturers/:magv", validate(lecturerValidator.update), lecturerManagementController.updateLecturer);
router.delete("/lecturer-management/lecturers", lecturerManagementController.deleteMultipleLecturers);
router.delete("/lecturer-management/lecturers/:magv", lecturerManagementController.deleteLecturer);

// Đăng ký thi
router.get("/exam-registration", examRegistrationController.page);
router.get("/exam-registration/registrations", examRegistrationController.list);
router.post("/exam-registration/check-questions", validate(examRegistrationValidator.checkQuestions), examRegistrationController.checkQuestions);
router.post("/exam-registration/registrations", validate(examRegistrationValidator.create), examRegistrationController.create);
router.put("/exam-registration/registrations/:maMonHoc/:maLop/:lan", validate(examRegistrationValidator.create), examRegistrationController.update);
router.delete("/exam-registration/registrations/:maMonHoc/:maLop/:lan", examRegistrationController.remove);
router.delete("/exam-registration/registrations", examRegistrationController.removeMultiple);

// Bảng điểm
router.get("/grade-report", gradeReportController.list);
router.get("/grade-report/report", gradeReportController.getReport);

// Tạo tài khoản
router.get("/account-create", accountCreateController.list);
router.get("/account-create/accounts", accountCreateController.getAccounts);
router.get("/account-create/lecturers", accountCreateController.getLecturersWithoutAccount);
router.post("/account-create/accounts", validate(accountValidator.create), accountCreateController.createAccount);
router.put("/account-create/accounts/:id", validate(accountValidator.update), accountCreateController.updateAccount);
router.delete("/account-create/accounts", accountCreateController.deleteMultipleAccounts);
router.delete("/account-create/accounts/:id", accountCreateController.deleteAccount);

module.exports = router;
