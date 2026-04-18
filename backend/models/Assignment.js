const mongoose = require("mongoose");

const completionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
    completedAt: { type: String, default: null }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    deadline: { type: String, required: true },
    notifyType: { type: String, enum: ["email", "sms", "both"], default: "email" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    completions: [completionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
