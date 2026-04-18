const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: String,
      required: true,
    },
    notifyType: {
      type: String,
      enum: ["email", "whatsapp", "sms", "both"],
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    proofImage: {
      type: String,
      default: null,
    },
    completedAt: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
