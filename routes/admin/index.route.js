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
router.get("/account-create", accountCreateController.list);

// Quản lý lớp và sinh viên (subform)
router.get("/class-management/classes", classManagementController.getClasses);
router.post("/class-management/classes", classManagementController.addClass);
router.put("/class-management/classes/:malop", classManagementController.updateClass);
router.delete("/class-management/classes", classManagementController.deleteClasses);
router.delete("/class-management/classes/:malop", classManagementController.deleteClass);
router.get("/class-management/students", classManagementController.getStudentsByClass);
router.post("/class-management/students", classManagementController.addStudent);
router.put("/class-management/students/:masv", classManagementController.updateStudent);
router.delete("/class-management/students", classManagementController.deleteStudents);
router.delete("/class-management/students/:masv", classManagementController.deleteStudent);

// Quản lý môn học (subject-management)
router.get("/subject-management/subjects", subjectManagementController.getSubjects);
router.post("/subject-management/subjects", subjectManagementController.createSubject);
router.put("/subject-management/subjects/:mamh", subjectManagementController.updateSubject);
router.delete("/subject-management/subjects", subjectManagementController.deleteMultipleSubjects);
router.delete("/subject-management/subjects/:mamh", subjectManagementController.deleteSubject);

// Quản lý giảng viên (lecturer-management)
router.get("/lecturer-management/lecturers", lecturerManagementController.getLecturers);
router.post("/lecturer-management/lecturers", lecturerManagementController.createLecturer);
router.put("/lecturer-management/lecturers/:magv", lecturerManagementController.updateLecturer);
router.delete("/lecturer-management/lecturers", lecturerManagementController.deleteMultipleLecturers);
router.delete("/lecturer-management/lecturers/:magv", lecturerManagementController.deleteLecturer);

// Bảng điểm (grade-report)
router.get("/grade-report/report", gradeReportController.getReport);

// Tạo tài khoản (account-create)
router.get("/account-create/accounts", accountCreateController.getAccounts);
router.get("/account-create/lecturers", accountCreateController.getLecturersWithoutAccount);
router.post("/account-create/accounts", accountCreateController.createAccount);
router.put("/account-create/accounts/:id", accountCreateController.updateAccount);
router.delete("/account-create/accounts", accountCreateController.deleteMultipleAccounts);
router.delete("/account-create/accounts/:id", accountCreateController.deleteAccount);

module.exports = router;



