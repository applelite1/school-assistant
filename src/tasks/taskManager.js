const tasks = [];
let nextId = 1;

function addTask(assignedTo, taskDescription, dueDate) {
  const task = {
    id: nextId++,
    assignedTo,
    taskDescription,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

function getTasks() {
  return tasks;
}

function getPendingTasks() {
  return tasks.filter(task => !task.completed);
}

function getOverdueTasks() {
  const now = new Date();
  return tasks.filter(task => !task.completed && new Date(task.dueDate) < now);
}

function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    return task;
  }
  return null;
}

module.exports = { addTask, getTasks, getPendingTasks, getOverdueTasks, completeTask };
