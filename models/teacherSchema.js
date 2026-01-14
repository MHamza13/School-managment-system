const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Teacher",
    },
    // --- Basic Information ---
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date, // Date of Birth
    },
    phone: {
      type: String,
      required: true,
    },
    cnic: {
      type: String, // Identity card number
      default: "",
    },
    teacherImage: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    
    // --- Professional Information ---
    qualification: {
      type: String,
      default: "",
    },
    experience: {
      type: String, // e.g., "5 Years"
      default: "",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    designation: {
      type: String, // e.g., "Senior Teacher", "HOD"
      default: "Teacher",
    },
    bio: {
      type: String,
      default: "",
    },
    
    // --- School Relations ---
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    teachSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
    },
    teachSclass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sclass",
      required: true,
    },

    // --- Financial Information ---
    salary: {
      type: Number,
      default: 0,
    },
    
    // --- Account Status ---
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },

    // --- Attendance Tracking ---
    attendance: [
      {
        date: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Leave"],
        },
        subName: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subject",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("teacher", teacherSchema);