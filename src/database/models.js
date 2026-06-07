const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  assignedTo: { type: String, required: true },
  assignedToPhone: { type: String },
  taskDescription: { type: String, required: true },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const conversationSchema = new mongoose.Schema({
  senderPhone: { type: String, required: true, unique: true },
  history: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);
const Task = mongoose.model('Task', taskSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Contact, Task, Conversation };
