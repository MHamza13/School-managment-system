const bcrypt = require("bcrypt");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");

// 1. REGISTER / ADMISSION (Updated with Admission Number & Status)
const studentRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // Check if Roll Number OR Admission Number already exists in the same school
    const existingStudent = await Student.findOne({
      $or: [
        { rollNum: req.body.rollNum, sclassName: req.body.sclassName },
        { admissionNumber: req.body.admissionNumber },
      ],
      school: req.body.adminID,
    });

    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Roll Number or Admission Number already exists" });
    }

    const student = new Student({
      ...req.body,
      school: req.body.adminID,
      password: hashedPass,
      role: "Student",
      status: "Active", // Default status for new admission
    });

    let result = await student.save();
    result.password = undefined; // Security: Hide password from response
    res.status(201).send(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// 2. LOGIN (Supports Login via Roll Number or Admission Number)
const studentLogIn = async (req, res) => {
  try {
    let student = await Student.findOne({
      $or: [
        { rollNum: req.body.rollNum },
        { admissionNumber: req.body.rollNum },
      ],
      name: req.body.studentName,
    });

    if (student) {
      const validated = await bcrypt.compare(
        req.body.password,
        student.password
      );
      if (validated) {
        student = await student.populate("school", "schoolName schoolLogo");
        student = await student.populate("sclassName", "sclassName");

        student.password = undefined;
        student.examResult = undefined;
        student.attendance = undefined;
        res.send(student);
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 3. GET ALL STUDENTS (Sorted by Admission Date)
const getStudents = async (req, res) => {
  try {
    let students = await Student.find({ school: req.params.id })
      .populate("sclassName", "sclassName")
      .populate("school", "schoolName schoolLogo")
      .select("-password") // Direct password removal
      .sort({ createdAt: -1 });

    if (students.length > 0) {
      res.send(students);
    } else {
      res.status(404).json({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. GET SINGLE STUDENT DETAIL
const getStudentDetail = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id)
      .populate("school", "schoolName schoolLogo")
      .populate("sclassName", "sclassName")
      .populate("examResult.subName", "subName")
      .populate("attendance.subName", "subName sessions")
      .select("-password");

    if (student) {
      res.send(student);
    } else {
      res.status(404).json({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 5. UPDATE STUDENT (Support for Status & Blood Group)
const updateStudent = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      updateFields.studentImage = req.file.path;
    }

    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
      .populate("school", "schoolName schoolLogo")
      .populate("sclassName", "sclassName")
      .select("-password");

    if (result) {
      res.send(result);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// 6. DELETE STUDENT APIs
const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Student deleted", result });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ school: req.params.id });
    res
      .status(200)
      .json({ message: `${result.deletedCount} students removed`, result });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    res.status(200).json({ message: "Students deleted from class", result });
  } catch (error) {
    res.status(500).json(error);
  }
};

// 7. EXAM RESULT (Updated with Total Marks)
const updateExamResult = async (req, res) => {
  const { subName, marksObtained, totalMarks } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existingResult = student.examResult.find(
      (r) => r.subName.toString() === subName
    );

    if (existingResult) {
      existingResult.marksObtained = marksObtained;
      if (totalMarks) existingResult.totalMarks = totalMarks;
    } else {
      student.examResult.push({
        subName,
        marksObtained,
        totalMarks: totalMarks || 100,
      });
    }

    const result = await student.save();
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// 8. ATTENDANCE LOGIC
const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const subject = await Subject.findById(subName);
    const existingAttendance = student.attendance.find(
      (a) =>
        a.date.toDateString() === new Date(date).toDateString() &&
        a.subName.toString() === subName
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// 9. CLEAR ATTENDANCE APIs
const clearAllStudentsAttendanceBySubject = async (req, res) => {
  try {
    const result = await Student.updateMany(
      { "attendance.subName": req.params.id },
      { $pull: { attendance: { subName: req.params.id } } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendance = async (req, res) => {
  try {
    const result = await Student.updateMany(
      { school: req.params.id },
      { $set: { attendance: [] } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendanceBySubject = async (req, res) => {
  try {
    const result = await Student.updateOne(
      { _id: req.params.id },
      { $pull: { attendance: { subName: req.body.subId } } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendance = async (req, res) => {
  try {
    const result = await Student.updateOne(
      { _id: req.params.id },
      { $set: { attendance: [] } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
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
};
