const userService = require("../services/userService");

async function getAll(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
}

async function create(req, res) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const result = await userService.softDeleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getStats(req, res) {
  try {
    const stats = await userService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove, getStats };
