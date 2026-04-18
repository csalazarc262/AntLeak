const expenseService = require("../services/expenseService");

async function create(req, res) {
  try {
    const data = { ...req.body, user_id: req.user.id };
    const expense = await expenseService.createExpense(data);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAll(req, res) {
  try {
    let expenses;
    if (req.user.role === "admin") {
      expenses = await expenseService.getAllExpenses();
    } else {
      expenses = await expenseService.getExpensesByUser(req.user.id);
    }
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getStats(req, res) {
  try {
    const stats = await expenseService.getExpenseStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const result = await expenseService.deleteExpense(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { create, getAll, getStats, remove };
