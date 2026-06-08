const { Contact } = require('../database/models');

async function saveContact(name, role, phone) {
  const contact = await Contact.create({ name, role, phone });
  return contact;
}

async function findContact(name) {
  const regex = new RegExp(name, 'i');
  return await Contact.findOne({ name: regex });
}

async function getAllContacts() {
  return await Contact.find().sort({ name: 1 });
}

async function deleteContact(name) {
  const regex = new RegExp(name, 'i');
  return await Contact.deleteOne({ name: regex });
}

async function updateContact(name, newRole) {
  const regex = new RegExp(name, 'i');
  const contact = await Contact.findOneAndUpdate(
    { name: regex },
    { role: newRole },
    { new: true }
  );
  return contact;
}

module.exports = { saveContact, findContact, getAllContacts, deleteContact, updateContact };
