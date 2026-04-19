const Task = require("../models/Task");

// GET all tasks
const getTasks = async (req, res) => {
<<<<<<< HEAD
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({
      deadline: 1,
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
=======
    try {
        const tasks = await Task.find().sort({ deadline: 1 });
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
>>>>>>> origin/feature/new-pages-and-database-cleanup
};

// ADD task
const addTask = async (req, res) => {
<<<<<<< HEAD
  try {
    const { title, description, deadline, notifyType, email, phone } = req.body;

    // Trim and normalize values
    const trimmedTitle = title ? String(title).trim() : "";
    const trimmedEmail = email ? String(email).trim() : "";
    const trimmedPhone = phone ? String(phone).trim() : "";

    // Validation
    if (!trimmedTitle || !deadline || !notifyType) {
      return res.status(400).json({
        success: false,
        message: "Title, deadline, and notifyType are required",
      });
    }

    if (notifyType === "email" && !trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required for email notifications",
      });
    }

    if (notifyType === "sms" && !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for SMS notifications",
      });
    }

    if (notifyType === "both" && !trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required for combined email+SMS notifications",
      });
    }

    if (notifyType === "both" && !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required for combined email+SMS notifications",
      });
    }

    const newTask = new Task({
      title: trimmedTitle,
      description: description ? String(description).trim() : "",
      deadline,
      notifyType,
      email: trimmedEmail || null,
      phone: trimmedPhone || null,
      userId: req.user.id,
      isCompleted: false,
      proofImage: null,
    });

    await newTask.save();
    res
      .status(201)
      .json({ success: true, message: "Task added", data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
};

// EDIT task
const editTask = async (req, res) => {
<<<<<<< HEAD
  try {
    const { id } = req.params;
    const { title, description, deadline, notifyType, email, phone } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, description, deadline, notifyType, email, phone },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task updated", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
};

// DELETE task
const deleteTask = async (req, res) => {
<<<<<<< HEAD
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
};

// MARK COMPLETE
const markComplete = async (req, res) => {
<<<<<<< HEAD
  try {
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isCompleted: true, completedAt: new Date().toISOString() },
      { new: true },
    );

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task marked as complete", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, addTask, editTask, deleteTask, markComplete };
=======
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
>>>>>>> origin/feature/new-pages-and-database-cleanup
