let tasks = [];

// GET all tasks
const getTasks = (req, res) => {
    res.json(tasks);
};

// ADD task
const addTask = (req, res) => {
    const { title, description, deadline, notifyType, email } = req.body;

    const newTask = {
        id: Date.now().toString(), // temporary ID until MongoDB
        title,
        description,
        deadline,
        notifyType,  // "email" or "whatsapp" (future)
        email,
        isCompleted: false,
        proofImage: null,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    res.json({ message: "Task added", data: newTask });
};

// EDIT task
const editTask = (req, res) => {
    const { id } = req.params;
    const { title, description, deadline, notifyType, email } = req.body;

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks[index] = {
        ...tasks[index],
        title,
        description,
        deadline,
        notifyType,
        email
    };

    res.json({ message: "Task updated", data: tasks[index] });
};

// DELETE task
const deleteTask = (req, res) => {
    const { id } = req.params;

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks.splice(index, 1);
    res.json({ message: "Task deleted" });
};

// MARK COMPLETE (without proof for now, proof added in next step)
const markComplete = (req, res) => {
    const { id } = req.params;

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks[index].isCompleted = true;
    tasks[index].completedAt = new Date().toISOString();

    res.json({ message: "Task marked as complete", data: tasks[index] });
};

module.exports = { getTasks, addTask, editTask, deleteTask, markComplete };