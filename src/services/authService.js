const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

async function login(username, password) {
  if (!username || !password) {
    throw new Error("Usuario y contraseña son requeridos");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("active", true)
    .single();

  if (error || !user) {
    throw new Error("Credenciales inválidas");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  };
}

async function register(data) {
  const { username, email, password } = data;

  if (!username || !email || !password) {
    throw new Error("Todos los campos son requeridos");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert([{ username, email, password_hash, role: "user" }])
    .select("id, username, email, role")
    .single();

  if (error) throw new Error(error.message);
  return user;
}

module.exports = { login, register };
