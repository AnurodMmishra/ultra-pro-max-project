const Task = require("../models/Task");

// GET all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ deadline: 1 });
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ADD task
const addTask = async (req, res) => {
    try {
        const { title, description, deadline, notifyType, email, phone } = req.body;

        // Validation
        if (!title || !deadline || !notifyType) {
            return res.status(400).json({ 
                success: false, 
                message: "Title, deadline, and notifyType are required" 
            });
        }

        if (notifyType === "email" && !email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required for email notifications" 
            });
        }

        if (notifyType === "whatsapp" && !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "Phone is required for WhatsApp notifications" 
            });
        }

        const newTask = new Task({
            title,
            description,
            deadline,
            notifyType,
            email,
            phone,
            isCompleted: false,
            proofImage: null
        });

        await newTask.save();
        res.status(201).json({ success: true, message: "Task added", data: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// EDIT task
const editTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, notifyType, email, phone } = req.body;

        const task = await Task.findByIdAndUpdate(
            id,
            { title, description, deadline, notifyType, email, phone },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task updated", data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// MARK COMPLETE
const markComplete = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByIdAndUpdate(
            id,
            { 
                isCompleted: true, 
                completedAt: new Date().toISOString() 
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task marked as complete", data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTasks, addTask, editTask, deleteTask, markComplete };