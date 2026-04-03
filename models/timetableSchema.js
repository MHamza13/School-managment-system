const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    // Class Link (One-to-One Relationship)
    sclass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sclass",
      required: true,
      unique: true, // Ek Class ka sirf ek Timetable hoga
    },
    
    // Columns Configuration (Managed via "Manage Periods")
    periodDefinitions: [
      {
        id: { type: String, required: true },    // e.g., "1", "p2", "break-1"
        name: { type: String, required: true },  // e.g., "1st Period"
        time: { type: String, required: true },  // e.g., "08:00 - 09:00"
        type: { type: String, default: "class" }, // "class" | "break"
        _id: false // Sub-document ke liye _id ki zaroorat nahi hai
      },
    ],

    // Actual Schedule Data
    // Structure:
    // Keys (Map keys): "Monday", "Tuesday", etc.
    // Values (Mixed): { "1": { subject: "Math", ... }, "2": { ... } }
    schedule: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);