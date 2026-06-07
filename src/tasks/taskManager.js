const { Task } = require('../database/models');

async function addTask(assignedTo, taskDescription, dueDate, assignedToPhone) {
  const task = await Task.create({
    assignedTo,
    assignedToPhone,
    taskDescription,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });
  return task;
}

async function getTasks() {
  return await Task.find().sort({ createdAt: -1 });
}

async function getPendingTasks() {
  return await Task.find({ completed: false }).sort({ createdAt: -1 });
}

async function getOverdueTasks() {
  return await Task.find({
    completed: false,
    dueDate: { $lt: new Date() },
  }).sort({ dueDate: 1 });
}

async function completeTask(taskId) {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { completed: true, completedAt: new Date() },
    { new: true }
  );
  return task;
}

module.exports = { addTask, getTasks, getPendingTasks, getOverdueTasks, completeTask };
