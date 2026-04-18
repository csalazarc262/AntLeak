const supabase = require("../config/supabase");

const VALID_CATEGORIES = [
  "alimentacion",
  "transporte",
  "entretenimiento",
  "salud",
  "ropa",
  "otros",
];

async function createExpense(data) {
  const { user_id, amount, date, category, description } = data;

  if (!user_id || amount == null || !date || !category) {
    throw new Error("Monto, fecha y categoría son requeridos");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("El monto debe ser un número positivo");
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Categoría inválida");
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert([{ user_id, amount, date, category, description }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return expense;
}

async function getExpensesByUser(userId) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

async function getAllExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, users(username)")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

async function getExpenseStats() {
  const { data, error } = await supabase.from("expenses").select("amount, user_id");

  if (error) throw new Error(error.message);

  const totalCount = data.length;
  const totalAmount = data.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const uniqueUsers = new Set(data.map((e) => e.user_id)).size;
  const averagePerUser = uniqueUsers > 0 ? totalAmount / uniqueUsers : 0;

  return { totalCount, totalAmount, averagePerUser };
}

async function deleteExpense(id, userId, role) {
  let query = supabase.from("expenses").delete().eq("id", id);
  if (role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
  return { message: "Gasto eliminado correctamente" };
}

module.exports = {
  createExpense,
  getExpensesByUser,
  getAllExpenses,
  getExpenseStats,
  deleteExpense,
  VALID_CATEGORIES,
};
