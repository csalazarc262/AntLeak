const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, active, created_at, deleted_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, active, created_at")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function createUser(userData) {
  const { username, email, password, role = "user" } = userData;

  if (!username || !email || !password) {
    throw new Error("Todos los campos son requeridos");
  }
  if (!["user", "admin"].includes(role)) {
    throw new Error("Rol inválido");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, password_hash, role }])
    .select("id, username, email, role, active, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function updateUser(id, updates) {
  const allowed = {};

  if (updates.email) allowed.email = updates.email;
  if (updates.role) {
    if (!["user", "admin"].includes(updates.role)) {
      throw new Error("Rol inválido");
    }
    allowed.role = updates.role;
  }
  if (updates.password) {
    allowed.password_hash = await bcrypt.hash(updates.password, 10);
  }

  const { data, error } = await supabase
    .from("users")
    .update(allowed)
    .eq("id", id)
    .select("id, username, email, role, active, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function softDeleteUser(id) {
  const { error } = await supabase
    .from("users")
    .update({ active: false, deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { message: "Usuario eliminado correctamente" };
}

async function getStats() {
  const { data, error } = await supabase.from("users").select("active, deleted_at");
  if (error) throw new Error(error.message);

  const total = data.length;
  const active = data.filter((u) => u.active).length;
  const deleted = data.filter((u) => u.deleted_at !== null).length;

  return { total, active, deleted };
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, softDeleteUser, getStats };
