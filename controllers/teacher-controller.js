const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { 
        name, email, password, role, school, teachSubject, 
        teachSclass, phone, address, qualification, bio, 
        salary, designation, experience 
    } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({
            name,
            email,
            password: hashedPass,
            role,
            school,
            teachSubject,
            teachSclass,
            phone,
            address,
            qualification,
            bio,
            salary,
            designation,
            experience
        });

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            return res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            
            if (teachSubject) {
                await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            }

            const populatedTeacher = await Teacher.findById(result._id)
                .populate("teachSclass", "sclassName")
                .populate("teachSubject", "subName sessions")
                .populate("school", "schoolName schoolLogo");

            let finalData = populatedTeacher.toObject();
            delete finalData.password;
            
            if (finalData.school && finalData.school.schoolLogo) {
                finalData.school.schoolLogo = finalData.school.schoolLogo.replace(/\\/g, "/");
            }

            res.send(finalData);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                const fullTeacherDetails = await Teacher.findById(teacher._id)
                    .populate("teachSclass", "sclassName")
                    .populate("teachSubject", "subName sessions")
                    .populate("school", "schoolName schoolLogo");

                let result = fullTeacherDetails.toObject();
                delete result.password;

                if (result.school && result.school.schoolLogo) {
                    result.school.schoolLogo = result.school.schoolLogo.replace(/\\/g, "/");
                }

                res.send(result);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSclass", "sclassName")
            .populate("teachSubject", "subName")
            .populate("school", "schoolName schoolLogo");

        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                const t = teacher.toObject();
                delete t.password;
                
                if (t.school && t.school.schoolLogo) {
                    t.school.schoolLogo = t.school.schoolLogo.replace(/\\/g, "/");
                }
                
                return t;
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSclass", "sclassName")
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName schoolLogo");

        if (teacher) {
            let result = teacher.toObject();
            delete result.password;

            if (result.school && result.school.schoolLogo) {
                result.school.schoolLogo = result.school.schoolLogo.replace(/\\/g, "/");
            }

            res.send(result);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacher = async (req, res) => {
    try {
        const { name, email, password, phone, address, qualification, bio, salary, designation, experience } = req.body;

        let updateFields = {
            name, email, phone, address, qualification, bio, salary, designation, experience
        };

        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        let result = await Teacher.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields }, 
            { new: true } 
        )
        .populate("teachSclass", "sclassName")
        .populate("teachSubject", "subName sessions")
        .populate("school", "schoolName schoolLogo");

        if (result) {
            let teacherData = result.toObject();
            delete teacherData.password; 

            if (teacherData.school && teacherData.school.schoolLogo) {
                teacherData.school.schoolLogo = teacherData.school.schoolLogo.replace(/\\/g, "/");
            }

            res.send(teacherData);
        } else {
            res.send({ message: "Teacher not found" });
        }

    } catch (error) {
        res.status(500).json(error);
    }
};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        )
        .populate("teachSclass", "sclassName")
        .populate("teachSubject", "subName sessions")
        .populate("school", "schoolName schoolLogo");

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        let result = updatedTeacher.toObject();
        delete result.password;

        if (result.school && result.school.schoolLogo) {
            result.school.schoolLogo = result.school.schoolLogo.replace(/\\/g, "/");
        }

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        if (deletedTeacher) {
            await Subject.updateOne(
                { teacher: deletedTeacher._id },
                { $unset: { teacher: 1 } }
            );
        }

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });
        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ teachSclass: req.params.id }); 
        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        await teacher.save();

        const populatedTeacher = await Teacher.findById(req.params.id)
             .populate("teachSclass", "sclassName")
             .populate("teachSubject", "subName sessions")
             .populate("school", "schoolName schoolLogo");
        
        let result = populatedTeacher.toObject();
        delete result.password;

        if (result.school && result.school.schoolLogo) {
            result.school.schoolLogo = result.school.schoolLogo.replace(/\\/g, "/");
        }

        return res.send(result);

    } catch (error) {
        res.status(500).json(error)
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacher,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};