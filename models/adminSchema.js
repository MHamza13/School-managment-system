const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
        default: "Admin"
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    },
    
    phone: {
        type: String,
        required: false, 
        default: ""
    },
    address: {
        type: String,
        required: false,
        default: ""
    },
    qualification: {
        type: String,
        required: false,
        default: ""
    },
    joiningDate: {
        type: Date,
        default: Date.now 
    },

    // --- Image Fields ---
    schoolBanner: {
        type: String,
        default: "" 
    },
    schoolLogo: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("admin", adminSchema);