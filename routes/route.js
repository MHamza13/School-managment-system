const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// --- Controllers Imports ---
const {
  adminRegister,
  adminLogIn,
  getAdminDetail,
  updateAdmin,
} = require("../controllers/admin-controller.js");
const {
  sclassCreate,
  sclassList,
  deleteSclass,
  deleteSclasses,
  getSclassDetail,
  getSclassStudents,
} = require("../controllers/class-controller.js");
const {
  complainCreate,
  complainList,
} = require("../controllers/complain-controller.js");
const {
  noticeCreate,
  noticeList,
  deleteNotices,
  deleteNotice,
  updateNotice,
} = require("../controllers/notice-controller.js");
const {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
} = require("../controllers/student_controller.js");
const {
  subjectCreate,
  classSubjects,
  deleteSubjectsByClass,
  getSubjectDetail,
  deleteSubject,
  freeSubjectList,
  allSubjects,
  deleteSubjects,
} = require("../controllers/subject-controller.js");

// *** TEACHER CONTROLLER IMPORTS (updateTeacher Added) ***
const {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  deleteTeachers,
  deleteTeachersByClass,
  deleteTeacher,
  updateTeacherSubject,
  teacherAttendance,
  updateTeacher,
} = require("../controllers/teacher-controller.js");

// ==========================================
// MULTER CONFIGURATION
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ==========================================
// ADMIN ROUTES
// ==========================================
router.post(
  "/AdminReg",
  upload.fields([
    { name: "schoolBanner", maxCount: 1 },
    { name: "schoolLogo", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
  ]),
  adminRegister
);

router.post("/AdminLogin", adminLogIn);
router.get("/Admin/:id", getAdminDetail);
router.put(
  "/AdminUpdate/:id",
  upload.fields([
    { name: "schoolBanner", maxCount: 1 },
    { name: "schoolLogo", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
  ]),
  updateAdmin
);

// ==========================================
// STUDENT ROUTES
// ==========================================
router.post("/StudentReg", studentRegister);
router.post("/StudentLogin", studentLogIn);
router.get("/Students/:id", getStudents);
router.get("/Student/:id", getStudentDetail);
router.delete("/Students/:id", deleteStudents);
router.delete("/StudentsClass/:id", deleteStudentsByClass);
router.delete("/Student/:id", deleteStudent);
router.put("/UpdateExamResult/:id", updateExamResult);
router.put("/StudentAttendance/:id", studentAttendance);
router.put(
  "/RemoveAllStudentsSubAtten/:id",
  clearAllStudentsAttendanceBySubject
);
router.put("/RemoveAllStudentsAtten/:id", clearAllStudentsAttendance);
router.put("/RemoveStudentSubAtten/:id", removeStudentAttendanceBySubject);
router.put("/RemoveStudentAtten/:id", removeStudentAttendance);
router.put("/Student/:id", upload.single("studentImage"), updateStudent);

// ==========================================
// TEACHER ROUTES
// ==========================================
router.post("/TeacherReg", teacherRegister);
router.post("/TeacherLogin", teacherLogIn);

router.get("/Teachers/:id", getTeachers);
router.get("/Teacher/:id", getTeacherDetail);

router.put("/TeacherUpdate/:id", upload.single("teacherImage"), updateTeacher);

router.delete("/Teachers/:id", deleteTeachers);
router.delete("/TeachersClass/:id", deleteTeachersByClass);
router.delete("/Teacher/:id", deleteTeacher);

router.put("/TeacherSubject", updateTeacherSubject);
router.post("/TeacherAttendance/:id", teacherAttendance);

// ==========================================
// NOTICE ROUTES
// ==========================================
router.post("/NoticeCreate", noticeCreate);
router.get("/NoticeList/:id", noticeList);
router.delete("/Notices/:id", deleteNotices);
router.delete("/Notice/:id", deleteNotice);
router.put("/Notice/:id", updateNotice);

// ==========================================
// COMPLAIN ROUTES
// ==========================================
router.post("/ComplainCreate", complainCreate);
router.get("/ComplainList/:id", complainList);

// ==========================================
// CLASS (SCLASS) ROUTES
// ==========================================
router.post("/SclassCreate", sclassCreate);
router.get("/SclassList/:id", sclassList);
router.get("/Sclass/:id", getSclassDetail);
router.get("/Sclass/Students/:id", getSclassStudents);
router.delete("/Sclasses/:id", deleteSclasses);
router.delete("/Sclass/:id", deleteSclass);

// ==========================================
// SUBJECT ROUTES
// ==========================================
router.post("/SubjectCreate", subjectCreate);
router.get("/AllSubjects/:id", allSubjects);
router.get("/ClassSubjects/:id", classSubjects);
router.get("/FreeSubjectList/:id", freeSubjectList);
router.get("/Subject/:id", getSubjectDetail);
router.delete("/Subject/:id", deleteSubject);
router.delete("/Subjects/:id", deleteSubjects);
router.delete("/SubjectsClass/:id", deleteSubjectsByClass);

module.exports = router;
