const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNum: { type: Number, required: true },
    password: { type: String, required: true },
    studentImage: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    
    // --- Nayi Zaruri Fields ---
    admissionNumber: { 
        type: String, 
        unique: true, 
        required: true 
    }, // Roll number change ho sakta hai, par Admission No hamesha same rehta hai
    admissionDate: { 
        type: Date, 
        default: Date.now 
    },
    bloodGroup: { type: String }, // Emergency ke liye zaruri hai
    status: { 
        type: String, 
        enum: ['Active', 'Suspended', 'Left', 'Graduated'], 
        default: 'Active' 
    }, // Isse pata chalega student abhi school mein hai ya nahi
    
    // --- Family Details ---
    fatherName: { type: String },
    fatherOccupation: { type: String }, // Background check ke liye
    motherName: { type: String },
    guardianPhone: { type: String },
    
    // --- Relations ---
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: { type: String, default: "Student" },

    // --- Fees Section (Bohat Zaruri) ---
    fees: [{
        month: { type: String },
        amount: { type: Number },
        status: { type: String, enum: ['Paid', 'Unpaid', 'Partially Paid'], default: 'Unpaid' },
        paidDate: { type: Date }
    }],

    // --- Academic Data ---
    examResult: [
        {
            subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
            marksObtained: { type: Number, default: 0 },
            totalMarks: { type: Number, default: 100 } // Total marks bhi honi chahiye percentage ke liye
        }
    ],
    attendance: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true }, // 'Leave' add kiya hai
        subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true }
    }]
}, { timestamps: true }); 

module.exports = mongoose.model("student", studentSchema);